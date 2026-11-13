package com.uvrenn.project70;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import java.util.Calendar;

final class ReminderScheduler {
    private static final String PREFS = "project70_native_reminders";
    private static final long DAILY_INTERVAL = AlarmManager.INTERVAL_DAY;

    private ReminderScheduler() {}

    static void scheduleDaily(
            Context context,
            String key,
            String title,
            String body,
            String time
    ) {
        if (time == null || !time.matches("\\d{2}:\\d{2}")) {
            return;
        }

        String[] pieces = time.split(":");
        int hour;
        int minute;
        try {
            hour = Integer.parseInt(pieces[0]);
            minute = Integer.parseInt(pieces[1]);
        } catch (NumberFormatException exception) {
            return;
        }
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit()
                .putBoolean("enabled", true)
                .putString(key + "_time", time)
                .putString(key + "_title", title)
                .putString(key + "_body", body)
                .apply();

        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, hour);
        next.set(Calendar.MINUTE, minute);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= System.currentTimeMillis()) {
            next.add(Calendar.DAY_OF_YEAR, 1);
        }

        Intent intent = new Intent(context, ReminderReceiver.class);
        intent.setAction("com.uvrenn.project70.REMINDER_" + key.toUpperCase());
        intent.putExtra("title", title);
        intent.putExtra("body", body);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode(key),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            // Inexact alarms do not require the special exact-alarm permission.
            alarmManager.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    next.getTimeInMillis(),
                    DAILY_INTERVAL,
                    pendingIntent
            );
        }
    }

    static void restore(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("enabled", false)) {
            return;
        }
        for (String key : new String[]{"workout", "meal", "recovery"}) {
            String time = prefs.getString(key + "_time", null);
            String title = prefs.getString(key + "_title", null);
            String body = prefs.getString(key + "_body", null);
            if (time != null && title != null && body != null) {
                scheduleDaily(context, key, title, body, time);
            }
        }
    }

    private static int requestCode(String key) {
        switch (key) {
            case "workout": return 701;
            case "meal": return 702;
            default: return 703;
        }
    }
}
