const { v4: uuidv4 } = require('uuid');

const rides = new Map();

exports.createRide = async (data) => {
  const ride = {
    id: uuidv4(),
    userId: data.userId,
    pickup: data.pickup,
    dropoff: data.dropoff,
    status: 'REQUESTED',
    createdAt: new Date()
  };

  rides.set(ride.id, ride);
  return ride;
};

exports.getRideById = async (id) => {
  return rides.get(id);
};
