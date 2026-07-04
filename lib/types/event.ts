export interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  city: string;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price: number | null;
  status: string;
}