export interface ICreateReviewPayload {
  customerId: string;
  gearItemId: string;
  rating: number;
  comment?: string;
}
