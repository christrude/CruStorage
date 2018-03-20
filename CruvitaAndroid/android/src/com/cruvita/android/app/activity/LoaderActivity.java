package com.cruvita.android.app.activity;

import java.util.Timer;
import java.util.TimerTask;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.cruvita.android.R;

public class LoaderActivity extends Activity
{
	// holds the delay to display the splash screen
	public static final long SPLASH_SCREEN_DELAY = 2000l;
	
	// holds the timer that will display the splash screen for a short period of time and then
	// continue with the app
	private Timer timer;
	
	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_loader);
		
	}
	
	@Override
	protected void onResume()
	{
		super.onResume();
		
		// restart the splash timer
		restartSplashTimer();
	}
	
	@Override
	protected void onPause()
	{
		super.onPause();
		
		// cancel the running timer
		cancelSplashTimer();
	}
	
	/**
	 * If there already is a running timer, cancel it
	 */
	private void cancelSplashTimer()
	{
		// check to see if there is an existing timer
		if (null != timer)
		{
			// cancel the old timer
			timer.cancel();
		}
	}
	
	/**
	 * Restarts the splash timer that will finish this activity and launch the next screen
	 */
	private void restartSplashTimer()
	{
		// cancel the old splash timer (if needed)
		cancelSplashTimer();
		
		// assign the timer
		timer = new Timer();
		
		// schedule the timer
		timer.schedule(new TimerTask()
		{
			@Override
			public void run()
			{
				// launch the next activity
				Intent intent = new Intent(getApplicationContext(), MainActivity.class);
				startActivity(intent);
				
				// finish this activity
				finish();
			}
		}, SPLASH_SCREEN_DELAY);
	}
}
