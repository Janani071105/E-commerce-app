import axios from 'axios';

const trackActivity = async (user, actionMessage) => {
  try {
    await axios.post('http://localhost:4000/api/admin/log-activity', {
      accountType: user.role, 
      entityId: user._id,   
      entityModel: user.role,
      entityName: user.role === 'Seller' ? user.storeName : user.name,
      actionDetail: actionMessage
    });
  } catch (err) {
    console.error("Failed to sync log:", err);
  }
};
