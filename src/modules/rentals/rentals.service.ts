import { get } from "http";

// Rentals Service placeholder
const createRentals = async () => {
  return "Rental created successfully";
};
const getRentals = async () => {
  return "All Rentals retrieved successfully";
};
const getRentalsById = async () => {
  return "Rental retrieved successfully";
};
const getPendingRentals = async () => {
  return "Rental retrieved successfully";
};
const approveRentalRequest = async () => {
  return "Rental retrieved successfully";
};

export const rentalService = {
  createRentals,
  getRentals,
  getRentalsById,
  getPendingRentals,
  approveRentalRequest,
};
