'use-strict'

const Mongoose = require('mongoose');
const Booking = require('../../models/booking');

/**
 * Function get all the bookings from database based on the filter.
 * @param  {Object} filter={} Json object contains filter data.
 */
exports.getAllBookings = async (filter = {}) => {
	try {
		let bookings = await Booking.find(filter);
		let allBookings = [];
		for (let index = 0; index < bookings.length; index++) {
			const booking = Object.assign({}, bookings[index]._doc);
			if(booking && booking.slots && booking.slots.length){
				booking.slots.sort();
				let slots = booking.slots;
				delete booking.slots;
				let startTime = slots[0];
				booking.startTime = startTime;
				let slotTIme = startTime;
				slots.forEach(slot => {
					if(slot !== slotTIme){
						endTime = slotTIme;
						slotTIme = slot;
						allBookings.push(Object.assign({},booking));
						booking.startTime = slot;
						let slotTimeParts = slotTIme.split(':');
						let hours = Number(slotTimeParts[0]);
						let minutes = Number(slotTimeParts[1]);
						if(minutes+15 < 60){
							minutes = minutes + 15;
						} else {
							hours = hours +1;
							minutes = 0;
						}
						slotTIme = `${twoDigitNumber(hours)}:${twoDigitNumber(minutes)}`;
					} else {
						booking.endTime = slotTIme;
						let slotTimeParts = slotTIme.split(':');
						let hours = Number(slotTimeParts[0]);
						let minutes = Number(slotTimeParts[1]);
						if(minutes+15 < 60){
							minutes = minutes + 15;
						} else {
							hours = hours +1;
							minutes = 0;
						}
						slotTIme = `${twoDigitNumber(hours)}:${twoDigitNumber(minutes)}`;
					}
				});
				booking.endTime = slots[slots.length-1];
				allBookings.push(Object.assign({},booking));
			}
		}
		return Promise.resolve(allBookings);
	} catch (error) {
		console.log('Error while getting users from database', error);
		return Promise.reject(error);
	}
}

/**
 * Function save booking information in database.
 * @param  {Object} bodyData Json object contains user data.
 */
exports.saveBooking = async (bodyData) => {
	try {
		let booking = new Booking(bodyData);
		await booking.save();
		return Promise.resolve();
	} catch (error) {
		console.log('Error while saving user in database', error);
		return Promise.reject(error);
	}
}

/**
 * Function update booking information in database.
 * @param  {Object} bodyData Json object contains user data.
 */
exports.updateBooking = async (bodyData, filter) => {
	try {
		await Booking.update(filter, {
			'$set': bodyData
		});
		return Promise.resolve();
	} catch (error) {
		console.log('Error while saving user in database', error);
		return Promise.reject(error);
	}
}

function twoDigitNumber(n){
    return n > 9 ? "" + n: "0" + n;
}