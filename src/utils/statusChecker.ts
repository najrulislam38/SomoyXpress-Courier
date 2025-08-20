import { ParcelStatus } from "../modules/parcel/parcel.interface";

export function isValidStatusTransition(
  currentStatus: ParcelStatus,
  newStatus: ParcelStatus
): boolean {
  const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
    [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
    [ParcelStatus.APPROVED]: [ParcelStatus.PICKED, ParcelStatus.CANCELLED],
    [ParcelStatus.PICKED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.RETURNED],
    [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
    [ParcelStatus.DELIVERED]: [],
    [ParcelStatus.CANCELLED]: [],
    [ParcelStatus.RETURNED]: [],
  };

  return validTransitions[currentStatus].includes(newStatus);
}
