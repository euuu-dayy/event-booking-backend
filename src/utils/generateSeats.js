const generateSeats = (
  totalSeats
) => {
  const seats = [];

  for (
    let i = 1;
    i <= totalSeats;
    i++
  ) {
    seats.push({
      seatNumber: `A${i}`,
    });
  }

  return seats;
};

export default generateSeats;