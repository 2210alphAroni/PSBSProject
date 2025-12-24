export interface AddOn {
  id: number;
  addOnName: string;
  price: number;
}

export interface Package {
  id: number;
  packageName: string;
  description: string;
  coverageDurationHours: number;
  maxEditedPhotos: number;
  rawFilesAvailable: boolean;
  basePrice: number;
  addOns: AddOn[];
}
