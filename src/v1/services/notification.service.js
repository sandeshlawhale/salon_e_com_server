import Notification from '../models/Notification.js';

export const createNotification = async (data) => {
    return await Notification.create(data);
};

export const getUserNotifications = async (userId) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        throw new Error('Notification not found');
    }
    return notification;
};
