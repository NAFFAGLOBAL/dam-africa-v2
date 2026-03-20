import Anthropic from '@anthropic-ai/sdk';
import { VersiumService } from './VersiumService';
import { CreditsService } from './CreditsService';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AgentService {
  private versium = new VersiumService();
  private credits: CreditsService;

  constructor(private userId: string) {
    this.credits = new CreditsService(userId);
  }

  async chat(messages: Anthropic.MessageParam[]): Promise<{
    reply: string;
    messages: Anthropic.MessageParam[];
    toolsUsed: string[];
  }> {
    const tools = this.buildTools();
    const toolsUsed: string[] = [];
    let response = await this.callClaude(messages, tools);
    let loops = 0;

    while (response.stop_reason === 'tool_use' && loops < 10) {
      loops++;
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        toolsUsed.push(block.name);
        const result = await this.executeTool(
          block.name,
          block.input as Record<string, unknown>
        );
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
      response = await this.callClaude(messages, tools);
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return {
      reply,
      messages: [
        ...messages,
        { role: 'assistant', content: response.content },
      ],
      toolsUsed,
    };
  }

  private async callClaude(
    messages: Anthropic.MessageParam[],
    tools: Anthropic.Tool[]
  ) {
    return client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: this.systemPrompt(),
      tools,
      messages,
    });
  }

  private async executeTool(
    name: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    try {
      switch (name) {
        case 'versium_contact_append':
          return this.versium.contactAppend(input);
        case 'versium_demographic_append':
          return this.versium.demographicAppend(input);
        case 'versium_firmographic_append':
          return this.versium.firmographicAppend(input);
        case 'versium_b2c_estimate':
          return this.versium.b2cEstimate(input);
        case 'versium_b2b_estimate':
          return this.versium.b2bEstimate(input);
        case 'versium_ip_domain':
          return this.versium.ipToDomain(input.ip as string);
        case 'check_user_credits':
          return this.credits.getBalance();
        case 'get_account_activity':
          return this.credits.getActivity(
            (input.limit as number) || 10
          );
        case 'deduct_credits':
          return this.credits.deduct(
            input.amount as number,
            input.description as string
          );
        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Tool failed' };
    }
  }

  private systemPrompt(): string {
    return `You are the SkipScout AI Copilot — an expert skip tracing and data intelligence assistant.

You help users:
- Skip trace individuals (find phone/email/address by name)
- Look up property and mortgage data by address
- Build targeted B2B or B2C lead lists with 80+ filters
- Look up business firmographic data by domain or name
- Identify businesses from IP addresses
- Manage and audit their SkipScout account credits

CRITICAL RULES — NEVER VIOLATE:
1. ALWAYS call check_user_credits before any billable Versium operation
2. If insufficient credits: tell user the cost, how many they need, and direct them to /credits to purchase
3. For list generation (b2c OR b2b):
   a. Call estimate tool first
   b. Show: Estimated Records Available, Estimated Records Returnable, preview table, cost (records × $0.30)
   c. Ask: "Confirm this list build? It will use X credits."
   d. Wait for explicit confirmation before proceeding
4. NEVER reveal Versium's actual API costs — only show SkipScout pricing
5. For property/mortgage: use demographic_append outputs ["financial","demographic","lifestyle"]
6. NEVER use "full_demographic" output — returns 403 on this account
7. NEVER pass max_records to estimates unless user explicitly requests a cap
8. NEVER use d_naics in B2B calls — only d_sic is valid
9. After successful billable Versium call: call deduct_credits
10. One clarifying question max if query is ambiguous
11. Format all data as clean markdown tables
12. Always suggest a logical next step after each result`;
  }

  private buildTools(): Anthropic.Tool[] {
    return [
      {
        name: 'versium_contact_append',
        description:
          'Skip trace a person — find current phone, email, mailing address. Use when user wants to locate an individual.',
        input_schema: {
          type: 'object' as const,
          properties: {
            first: { type: 'string' },
            last: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
      {
        name: 'versium_demographic_append',
        description:
          'Get property, mortgage, financial, demographic profile for a household. Use outputs: ["financial"] for mortgage only, ["financial","demographic","lifestyle"] for full profile. NEVER use full_demographic.',
        input_schema: {
          type: 'object' as const,
          required: ['outputs'],
          properties: {
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            first: { type: 'string' },
            last: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            match_type: {
              type: 'string',
              enum: ['hhld', 'indiv'],
            },
            outputs: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'financial',
                  'demographic',
                  'lifestyle',
                  'political',
                ],
              },
            },
          },
        },
      },
      {
        name: 'versium_firmographic_append',
        description:
          'Look up business data — revenue, employees, industry, address, SIC code. Provide domain for best results.',
        input_schema: {
          type: 'object' as const,
          properties: {
            domain: { type: 'string' },
            business: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
      {
        name: 'versium_b2b_estimate',
        description:
          'Estimate B2B business contact list. Filter by SIC code, state, revenue, employees, title seniority, department. NEVER pass max_records unless user explicitly caps. NEVER use d_naics.',
        input_schema: {
          type: 'object' as const,
          required: ['output'],
          properties: {
            d_sic: {
              type: 'array',
              items: { type: 'string' },
              description:
                '4-digit SIC codes e.g. ["7033"] for RV parks',
            },
            d_state: {
              type: 'array',
              items: { type: 'string' },
            },
            d_salesvolume: {
              type: 'string',
              description:
                'min-max in dollars e.g. "500000-5000000"',
            },
            d_numemployees: {
              type: 'string',
              description: 'min-max e.g. "10-500"',
            },
            rd_title_seniority: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Owner/President',
                  'C-Level',
                  'VP/Sr. Executive',
                  'Director',
                  'Manager',
                  'Non-Manager',
                ],
              },
            },
            rd_department: {
              type: 'array',
              items: { type: 'string' },
            },
            output: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['email'],
              },
            },
          },
        },
      },
      {
        name: 'versium_b2c_estimate',
        description:
          'Estimate consumer audience list. Filter by state, age, home year, purchase date, ownership, income, credit, lifestyle, and 80+ filters. NEVER pass max_records unless user explicitly caps. Note: d_dwellingtype must be a string not array.',
        input_schema: {
          type: 'object' as const,
          required: ['required_fields'],
          properties: {
            d_state: {
              type: 'array',
              items: { type: 'string' },
            },
            d_age: {
              type: 'string',
              description: 'e.g. "55-99"',
            },
            d_home_year: {
              type: 'string',
              description: 'e.g. "1940-1994"',
            },
            d_home_purchase_date: {
              type: 'string',
              description:
                'Range: YYYYMMDD-YYYYMMDD, min 19600101',
            },
            d_ownrent: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['H', 'R', '9'],
              },
            },
            d_dwellingtype: {
              type: 'string',
              enum: ['S', 'M', 'U'],
              description:
                'String not array: S=Single Family',
            },
            d_gender: { type: 'string', enum: ['M', 'F'] },
            d_maritalstatus: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['M', 'S', 'A', 'B'],
              },
            },
            d_senior_hhld: {
              type: 'string',
              enum: ['Y'],
            },
            d_investing_active: {
              type: 'string',
              enum: ['Y'],
            },
            required_fields: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'address',
                  'email',
                  'phone',
                  'phone_mobile',
                ],
              },
            },
            optional_fields: {
              type: 'array',
              items: { type: 'string' },
            },
            include_demo_categories: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'b2cDemographic',
                  'b2cHouseFinAuto',
                  'b2cLifestyleInterest',
                ],
              },
            },
          },
        },
      },
      {
        name: 'versium_ip_domain',
        description:
          'Identify what business an IPv4 address belongs to.',
        input_schema: {
          type: 'object' as const,
          required: ['ip'],
          properties: { ip: { type: 'string' } },
        },
      },
      {
        name: 'check_user_credits',
        description:
          'Check current user credit balance. ALWAYS call before any billable Versium operation.',
        input_schema: { type: 'object' as const, properties: {} },
      },
      {
        name: 'get_account_activity',
        description:
          'Get recent account activity and credit usage history for audit.',
        input_schema: {
          type: 'object' as const,
          properties: {
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'deduct_credits',
        description:
          'Deduct credits after a successful billable operation. Call after every successful Versium data retrieval.',
        input_schema: {
          type: 'object' as const,
          required: ['amount', 'description'],
          properties: {
            amount: { type: 'number' },
            description: { type: 'string' },
          },
        },
      },
    ];
  }
}
