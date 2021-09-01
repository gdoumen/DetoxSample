package com.sampleapp;

import android.app.Activity;
import android.content.Intent;

import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.intercepting.SingleActivityFactory;

import org.jetbrains.annotations.Nullable;

public class DetoxTestRule<T extends Activity> extends ActivityTestRule<T> {


    public DetoxTestRule(Class<T> activityClass, boolean initialTouchMode, boolean launchActivity) {
        super(activityClass, initialTouchMode, launchActivity);
    }

    public T launchActivity(@Nullable Intent startIntent) {

        startIntent.putExtra("detoxServer","ws://incyclist.com:8099");
        startIntent.putExtra("detoxSessionId","DetoxSample");

        return super.launchActivity( startIntent);

    }
}
