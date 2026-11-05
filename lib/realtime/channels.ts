/** Staff-only private channel for live inquiry notifications. */
export const STAFF_NOTIFICATIONS_CHANNEL = "private-staff-notifications";

export const INQUIRY_CREATED_EVENT = "inquiry.created";

export type InquiryCreatedPayload = {
  id: string;
  phone: string;
  productName: string | null;
  productCode: string | null;
  createdAt: string;
};
