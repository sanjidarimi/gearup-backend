import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    gearItemId: z.string({ message: "Gear Item ID is required" }),
    rating: z
      .number({ message: "Rating is required" })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z.string().optional(),
  }),
});
