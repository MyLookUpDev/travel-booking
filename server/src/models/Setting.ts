import mongoose from "mongoose";
const settingSchema = new mongoose.Schema({
  key: String,
  value: String,
});
export default mongoose.model("Setting", settingSchema);
