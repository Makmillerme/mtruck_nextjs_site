/** Staff-only private channel for live inquiry / request notifications. */
export const STAFF_NOTIFICATIONS_CHANNEL = "private-staff-notifications";

export const INQUIRY_CREATED_EVENT = "inquiry.created";
export const ORDER_REQUEST_CREATED_EVENT = "order.request.created";

export type StaffNotificationKind = "inquiry" | "vehicle-request";

export type InquiryCreatedPayload = {
  id: string;
  phone: string;
  productName: string | null;
  productCode: string | null;
  createdAt: string;
  kind?: StaffNotificationKind;
};

export type OrderRequestCreatedPayload = {
  id: string;
  phone: string;
  /** Short note preview for the dropdown. */
  note: string | null;
  createdAt: string;
};
