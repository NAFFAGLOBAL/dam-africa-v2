export class VersiumService {
  private apiKey = process.env.VERSIUM_API_KEY!;
  private baseUrl = process.env.VERSIUM_BASE_URL || 'https://api.versium.com/v2';

  private async call(endpoint: string, params: Record<string, unknown>) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v, i) => url.searchParams.set(`${key}[${i}]`, String(v)));
      } else if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        'X-Versium-Api-Key': this.apiKey,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Versium ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  contactAppend = (p: Record<string, unknown>) => this.call('contact', p);

  demographicAppend = (p: Record<string, unknown>) => this.call('demographic', p);

  firmographicAppend = (p: Record<string, unknown>) => this.call('firmographic', p);

  b2cEstimate = (p: Record<string, unknown>) =>
    this.call('b2cListGen/estimate', { ...p, rcfg_show_preview: 1 });

  b2bEstimate = (p: Record<string, unknown>) =>
    this.call('personalistgen/estimate', { ...p, rcfg_show_preview: 1 });

  ipToDomain = (ip: string) => this.call('ip2domain', { ip });
}
