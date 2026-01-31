class Booking {
  constructor({ id, pickup, dropoff, fare, driverId, status }) {
    this.id = id;
    this.pickup = pickup;
    this.dropoff = dropoff;
    this.fare = fare;
    this.driverId = driverId;
    this.status = status || "CREATED";
    this.createdAt = new Date();
  }
}

module.exports = Booking;

