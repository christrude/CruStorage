package com.cruvita.android.app.activity;

import android.app.Activity;
import android.content.res.Configuration;
import android.location.Location;
import android.os.Bundle;
import android.support.v4.app.ActionBarDrawerToggle;
import android.support.v4.widget.DrawerLayout;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;

import com.cruvita.android.R;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.GoogleApiClient.ConnectionCallbacks;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.model.LatLng;

public class MainActivity extends Activity implements ConnectionCallbacks
{
	public static final int DEFAULT_ZOOM_LEVEL = 11;
	
	private DrawerLayout drawerLayout;
	private ActionBarDrawerToggle drawerToggle;
	
	private GoogleApiClient googleApiClient;
	
	// holds the reference to the map
	private GoogleMap map;
	
	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		// build the google api client
		googleApiClient = new GoogleApiClient.Builder(this)
			.addConnectionCallbacks(this)
			.addApi(LocationServices.API)
			.build();
		googleApiClient.connect();
		
		// retrieve the reference to the map fragment and load it with this activity
		MapFragment mapFragment = (MapFragment) getFragmentManager().findFragmentById(R.id.map);
		map = mapFragment.getMap();
		
		drawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
		drawerToggle =
			new ActionBarDrawerToggle(this, drawerLayout, R.drawable.ic_drawer, R.string.app_name, R.string.app_name)
			{
				/**
				 * Called when a drawer has settled in a completely closed state.
				 */
				public void onDrawerClosed(View view)
				{
					super.onDrawerClosed(view);
					getActionBar().setTitle(R.string.app_name);
				}
				
				/**
				 * Called when a drawer has settled in a completely open state.
				 */
				public void onDrawerOpened(View drawerView)
				{
					super.onDrawerOpened(drawerView);
					getActionBar().setTitle(R.string.app_name);
				}
			};
		
		// Set the drawer toggle as the DrawerListener
		drawerLayout.setDrawerListener(drawerToggle);
		
		getActionBar().setDisplayHomeAsUpEnabled(true);
		getActionBar().setHomeButtonEnabled(true);
	}
	
	@Override
	protected void onPostCreate(Bundle savedInstanceState)
	{
		super.onPostCreate(savedInstanceState);
		
		// Sync the toggle state after onRestoreInstanceState has occurred.
		drawerToggle.syncState();
	}
	
	@Override
	public void onConfigurationChanged(Configuration newConfig)
	{
		super.onConfigurationChanged(newConfig);
		drawerToggle.onConfigurationChanged(newConfig);
	}
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu)
	{
		// Inflate the menu items for use in the action bar
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main_activity_actions, menu);
		return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item)
	{
		// Pass the event to ActionBarDrawerToggle, if it returns
		// true, then it has handled the app icon touch event
		if (drawerToggle.onOptionsItemSelected(item))
		{
			return true;
		}
		else
		{
			// Handle presses on the action bar items
			switch (item.getItemId())
			{
				case R.id.action_search:
					// :TODO: display the search activity
					return true;
				default:
					return super.onOptionsItemSelected(item);
			}
		}
	}
	
	@Override
	public void onConnected(final Bundle connectionHint)
	{
		// retrieve the last known location from the app
		Location lastLocation = LocationServices.FusedLocationApi.getLastLocation(
			googleApiClient);
		
		// check to see if the location is not null
		if (null != lastLocation)
		{
			// create a new lat/long for the last known location and zoom into that on the map
			LatLng latLng = new LatLng(lastLocation.getLatitude(), lastLocation.getLongitude());
			map.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, DEFAULT_ZOOM_LEVEL));
		}
	}
	
	@Override
	public void onConnectionSuspended(int arg0)
	{
		
	}
}
