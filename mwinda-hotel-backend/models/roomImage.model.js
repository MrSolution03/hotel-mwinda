module.exports = (sequelize, Sequelize) => {
  const RoomImage = sequelize.define("room_images", {
    url: { type: Sequelize.STRING, allowNull: false }
  });
  return RoomImage;
};