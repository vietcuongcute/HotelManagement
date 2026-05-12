export interface Room {
  id: number;
  roomNumber: string;
  name: string;
  floor : number;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  status: string;
}