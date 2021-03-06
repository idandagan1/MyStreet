import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const streetSchema = new Schema({

    streetName: {
        type: String,
    },
    placeId: {
        type: String,
    },
    location: {
        type: [Number],
        index: '2dsphere',
    },
    address: {
        type: String,
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    admins: [{
        type: ObjectId,
        ref: 'user',
    }],
    members: [{
        type: ObjectId,
        ref: 'user',
    }],
    postsfeed: [{
        type: ObjectId,
        ref: 'post',
    }],
}, { collection: 'street' });

mongoose.model('primaryStreet', streetSchema);
export const Street = mongoose.model('street', streetSchema);

export function addMember(newMemberID, streetID) {

    if (!streetID || !newMemberID) {
        return;
    }

    Street.findByIdAndUpdate(streetID, { $addToSet: { members: newMemberID } }).exec()
        .then(street => {
            if (street) {
                console.log('Added member');
            }
        });
}
