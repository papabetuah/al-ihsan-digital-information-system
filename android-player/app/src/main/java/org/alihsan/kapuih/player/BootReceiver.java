package org.alihsan.kapuih.player;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? "" : intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
                && !Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)) {
            return;
        }

        Intent launch = new Intent(context, MainActivity.class);
        launch.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        try {
            context.startActivity(launch);
        } catch (RuntimeException ignored) {
            // On Android versions that restrict background activity starts,
            // setting this app once as the default HOME launcher guarantees startup.
        }
    }
}
