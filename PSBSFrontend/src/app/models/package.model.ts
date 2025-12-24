export interface AddOn {
  name: string;
  price: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  coverageDurationHours: number;
  maxEditedPhotos: number;
  rawFilesAvailable: boolean;
  basePrice: number;
  addOns: AddOn[];
}
