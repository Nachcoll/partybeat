/*We dont want a DB because everything is going to happen on Spotify.
Saving the songs or even the users is pointless because they will have
to log into spotify for the refreshed token anyways and we will be forced
to fetch all the info and update it again since an user may have created a
playlist OUTSIDE of our webapp.
Thats the reason we only save users here as a temporally data.*/
const db = {users: []};

export default db
