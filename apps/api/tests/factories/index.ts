/**
 * Test Factories Index - DAM Africa V2
 * Export all factories from a single entry point
 */

export { UserFactory } from './user.factory';
export { LoanFactory } from './loan.factory';
export { PaymentFactory } from './payment.factory';
export { VehicleFactory } from './vehicle.factory';
export { KYCFactory } from './kyc.factory';

/**
 * Reset all factories (useful in beforeEach)
 */
export function resetAllFactories() {
  UserFactory.reset();
  PaymentFactory.reset();
  VehicleFactory.reset();
  KYCFactory.reset();
}
