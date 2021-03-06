/* eslint-disable no-underscore-dangle, consistent-return, no-param-reassign */
import { Street } from '../models/street';
import { User } from '../models/user';

export const getStreetsNearPrimaryStreet = async (req, res, next) => {
    const { _id: userId } = req.session.user;
    const radiusInMeters = 2000;
    const limit = 5;
    let myLocation;

    if (!userId) {
        return res.send('userId', 400);
    }

    try {

        const user = await User.findById(userId).populate('local.primaryStreet').exec();
        if (user) {
            const coords = [];
            myLocation = user.local.primaryStreet.placeId;
            coords[0] = user.local.primaryStreet.location[0];
            coords[1] = user.local.primaryStreet.location[1];

            const streets = await getStreetsNearPoint(radiusInMeters, limit, coords);
            return res.send({
                myLocation,
                list: streets,
                status: 'ok',
            });
        }

    } catch (err) {
        console.error(err);
        return res.status(404).send({ msg: err });
    }

}

export const getStreets = async (req, res, next) => {
    // This method returns a list of streets from the user's street list.
    const userID = req.session.user._id;// TO CHANGE

    if (!userID) {
        return res.status(404).send('UserID', 404);
    }

    try {
        const user = await User.findOne({ _id: userID }).populate('local.streets').exec();
        console.log('getStreets execute successfully');
        return res.send({ content: user.local.streets, status: "ok" });
    } catch (err) {
        console.error(err);
        res.status(400).send({ msg: err });
    }

}

export const getMembers = async (req, res, next) => {

    const { placeId } = req.query;

    if (!placeId) {
        console.log('placeId missing');
        return res.send('placeId', 400);
    }

    try {
        const selectedStreet = await Street.findOne({ placeId }).populate('members').exec();
        console.log('getMembers executed successfully');
        return res.status(200).send({ selectedStreet });
    } catch (err) {
        console.error(err);
        return res.status(500).send( { msg: err });
    }

}

export const addStreet = async (req, res, next) => {

    const { streetName, placeId, address } = req.body;
    const location = req.body.location ? [req.body.location[0], req.body.location[1]] : null;
    const user_id = req.session.user._id;

    req.check('streetName', 'Name is empty').notEmpty();
    req.check('placeId', 'placeId is empty').notEmpty();
    req.check('location', 'location is empty').notEmpty();

    const errors = req.validationErrors();

    if (errors || !user_id) {
        return res.status(500).send(`There have been validation errors: ${errors}`, 400);
    }

    try {
        const street = await createStreet(placeId, user_id, location, streetName, address);
        req.session.selectedStreet = street;
        req.session.save();
        addStreetToUser(user_id, street, req, res);
        return;
    } catch (err) {
        console.error(err);
        return res.status(404).send({ msg: 'street not found' });
    }

}

export const leaveStreet = async (req, res, next) => {

    const { streetId } = req.query;
    const { _id: userId } = req.session.user;

    if (!userId || !streetId) {
        return res.status(404).send('There have been validation errors', 400);
    }

    try {

        const street = await Street.findByIdAndUpdate(streetId, { $pull: { members: userId, admins: userId } },
            { new: true })
            .exec();

        if (street && street.members.length === 0) {
            street.remove();
            console.log('Removed street');
        }

        const activeUser = await User.findByIdAndUpdate({ _id: userId }, { $pull: { 'local.streets': streetId } },
            { new: true })
            .populate(['local.streets', 'local.primaryStreet']).exec();
        if (!activeUser.local.primaryStreet) {
            activeUser.local.primaryStreet = activeUser.local.streets[0];
        }
        activeUser.save();
        req.session.user = activeUser;
        req.session.save();
        console.log('Removed street from users list');
        return res.status(200).send({ activeUser, msg: 'Primary street has been changed' });

    } catch(err) {
        console.error(err);
        return res.status(404).send({ msg: err });
    }

}

export const getStreetByPlaceId = async (req, res, next) => {

    const { placeId } = req.query;

    if (!placeId) {
        console.error('getStreetByPlaceId: no placeId');
        return res.status(404).send({ msg: 'getStreetByPlaceId: no placeId' });
    }

    try {
        const selectedStreet = await Street.findOne({ placeId })
            .populate([{
                path: 'postsfeed',
                model: 'post',
                options: {
                    sort: { createDate: -1 },
                },
                populate: ['author', 'comments.author'],
            }, 'members'])
            .exec();

        return res.status(200).send({ selectedStreet });

    } catch (err) {
        console.error(err);
        return res.status(404).send({ msg: 'street not found' });
    }

}

export const changePrimaryStreet = async (req, res, next) => {

    const { streetId } = req.query;
    const { user: { _id: userId } } = req.session;

    if (!userId || !streetId) {
        return res.status(400).send({ msg: 'There have been validation errors' });
    }

    try {
        const activeUser = await User.findOneAndUpdate({ _id: userId },
                { 'local.primaryStreet': streetId },
                { upsert: true, new: true })
                .populate([{
                    path: 'facebook.friends',
                    populate: ['local.primaryStreet'],
                }, 'local.streets', 'local.primaryStreet']).exec();

        req.session.user = activeUser;
        req.session.save();
        console.log('Primary street has been changed');
        return res.status(200).send({ activeUser, msg: 'Primary street has been changed' });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ msg: 'Error while changing street' });
    }
}

export const getStreetAdmins = (req, res, next) => {

    const { streetID } = req.session;

    if (!streetID) {
        return res.status(404).send('streetID', 400);
    }

    Street.findOne({ _id: streetID }, { admins: 1, _id: 0 })
        .populate('admins')
        .exec((err, street) => {
            if (err) throw err;

            if (street) {
                res.send(street.admins);
            }
        });
}

export const getSelectedStreet = (req, res, next) => {
    const { selectedStreet } = req.session;

    if (!selectedStreet || !selectedStreet.placeId) {
        return res.status(200).send({ msg: 'no placeId' });
    }

    getStreetByPlaceId(selectedStreet.placeId)
        .then(street => {
            req.session.selectedStreet = street;
            req.session.save();
            return res.status(200).send({ selectedStreet: street });
        });
}

export const getNearbyStreets = (req, res, next) => {
    const maxDistance = 1000;
    const minDistance = 5;
    const limit = 8;
    const coords = JSON.parse(req.query.location);

    if (!coords) {
        return res.send('location is missing', 400);
    }

    Street.find(
        {
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coords,
                    },
                    $maxDistance: maxDistance,
                    $minDistance: minDistance,
                },
            },
        })
        .lean()

        .populate({ path: 'members', model: 'user' })

        .limit(limit)

        .then(streetsNearby =>
            res.send({
                streetsNearby,
                status: 'ok',
            })
        )
        .catch(err =>
            res.status(400).send({ msg: err })
        )

}

export const getAdmins = (req, res, next) => {
    const streetID = req.session.streetID;

    if (!streetID) {
        return res.send('streetID', 400);
    }

    Street.findOne({ _id: streetID }, { admins: 1, _id: 0 }).populate('admins').exec()
        .then(street => {
            if (street) {
                return res.send(street.admins);
            }
        }
    );
}

export const addAdmin = (req, res, next) => {

    const { newAdmin: newAdminId } = req.body;
    const { streetId } = req.session;

    req.check('newAdmin', 'newAdmin is empty').notEmpty();

    const errors = req.validationErrors();

    if (errors || !newAdminId) {
        return res.status(500).send(`There have been validation errors: ${errors}`, 400);
    }

    Street.findByIdAndUpdate(streetId, { $addToSet: { admins: newAdminId } }).exec()
        .then(street => {
            if (street) {
                console.log('Added admin');
                return res.status(200).send({ msg: 'Added admin' });
            }
        })
        .catch(next);
}

export const changeStreetPrivacy = (req, res, next) => {

    const { streetID, user: { _id: userID } } = req.session;
    const { status: newStatus } = req.body;

    if (!streetID || !userID) {
        return res.send('streetID or userID', 400);
    }

    if (newStatus !== 'false' && newStatus !== 'true') {
        return res.send('newStatus', 400);
    }

    Street.findOneAndUpdate({ _id: streetID, admins: userID },
        { isPublic: newStatus },
        { new: true }).exec()
        .then(
            street => {
                if (street) {
                    res.send({ content: street, status: 'ok', msg: 'Street has been changed' });
                }
            })
        .catch(next);

}

function getStreetsNearPoint(radius, limit, coords) {
    return new Promise((resolve, reject) => {

        if (!radius || !coords || coords.length !== 2) {
            reject();
        }

        Street.find(
            {
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: coords },
                        $maxDistance: radius,
                        $minDistance: 10,
                    },
                },
            })
            .lean()

            .populate({ path: 'members', model: 'user', select: 'name' })

            .limit(limit)

            .then(result => resolve(result))

            .catch(err => reject(err));

    })

}

function addStreetToUser(user_id, street, req, res) {

    return new Promise((resolve, reject) => {

        if (!user_id || !street) {
            reject(new Error('userId or street is missing'));
        }

        User.findOneAndUpdate({ _id: user_id },
            { $addToSet: { 'local.streets': street._id } },
            { new: true, passRawResult: true })
            .populate(['local.streets', 'local.primaryStreet', {
                path: 'facebook.friends',
                populate: ['local.primaryStreet'],
            }])
            .then((user, err) => {
                if (err) throw err;
                if (user) {
                    if (user.local.streets.length === 1) {
                        user.local.primaryStreet = street;
                        user.save();
                        console.log('Added street to members list');
                    }
                    req.session.user = user;
                    req.session.save();
                }
                Street.populate(street, [{
                    path: 'postsfeed',
                    model: 'post',
                    options: {
                        sort: { createDate: -1 },
                    },
                    populate: ['author', 'comments.author'],
                }, { path: 'members', model: 'user' }])
                    .then(populatedStreet => {
                        res.send({
                            content: {
                                selectedStreet: populatedStreet,
                                activeUser: user,
                            },
                            msg: 'AddStreet execute successfully',
                        });
                        resolve();
                    })
                    .catch(err => reject(err));
            });
    });
}

function createStreet(placeId, user_id, location, streetName, address) {

    return new Promise((resolve, reject) => {

        if (!placeId) {
            reject(null);
        }

        Street.findOneAndUpdate({ placeId },
            { $addToSet: { members: user_id } },
            { new: true })
            .populate('members')
            .then((street, err) => {
                if (street) {
                    console.log('Street already exist');
                    return resolve(street);
                }
                const selectedStreet = new Street({
                    streetName,
                    placeId,
                    members: user_id,
                    location,
                    address,
                    admins: user_id,
                });
                selectedStreet.save();
                console.log('New street added');
                resolve(selectedStreet);
            });
    });
}
