import webpush from 'web-push';
import User from '../models/User.js';

webpush.setVapidDetails(
    'mailto:' + process.env.MAIL_USER,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a Web Push notification to all subscriptions of a user.
 * @param {string} userId - MongoDB user _id
 * @param {{ title: string, body: string, link?: string, icon?: string }} payload
 */
export async function sendPushToUser(userId, payload) {
    try {
        const user = await User.findById(userId).select('pushSubscriptions');
        if (!user || !user.pushSubscriptions.length) return;

        const notification = JSON.stringify({
            title: payload.title,
            body:  payload.body,
            link:  payload.link || '/',
            icon:  payload.icon || '/favicon.ico',
        });

        const results = await Promise.allSettled(
            user.pushSubscriptions.map(sub =>
                webpush.sendNotification(sub, notification)
            )
        );

        // Remove any expired subscriptions (410 Gone)
        const validSubs = user.pushSubscriptions.filter((_, i) => {
            const result = results[i];
            return !(result.status === 'rejected' &&
                result.reason?.statusCode === 410);
        });

        if (validSubs.length !== user.pushSubscriptions.length) {
            await User.findByIdAndUpdate(userId, { pushSubscriptions: validSubs });
        }
    } catch (err) {
        console.error('[pushService] Error:', err.message);
    }
}

export { webpush };
