interface IRentalItemPayload {
  gearItemId: string;
  quantity: number;
}

export interface IRentalOrderPayload {
  customerId: string;
  startDate: string;
  endDate: string;
  items: IRentalItemPayload[];
}