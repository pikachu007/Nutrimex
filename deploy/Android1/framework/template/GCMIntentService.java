package $$app.package$$;

import oracle.adfmf.framework.pushnotification.GCMIntentServiceHelper;
import android.content.Context;
import android.content.Intent;

import com.google.android.gcm.GCMBaseIntentService;

/**
 * This class services any incoming push notification event - registration (success/failure), notification arrival etc.
 * The package of this class should be same as Android application package.
 */
public class GCMIntentService
  extends GCMBaseIntentService
{

  private GCMIntentServiceHelper gcmHelper;

  public GCMIntentService()
  {
    super();
    gcmHelper = new GCMIntentServiceHelper(R.string.app_name, R.drawable.adfmf_icon);
  }

  @Override
  protected void onRegistered(Context arg0, String registrationId)
  {
    gcmHelper.onRegistered(arg0, registrationId);
  }

  @Override
  protected void onUnregistered(Context arg0, String arg1)
  {
    gcmHelper.onUnregistered(arg0, arg1);
  }

  @Override
  protected void onMessage(Context arg0, Intent arg1)
  {
    gcmHelper.onMessage(arg0, arg1);
  }

  @Override
  protected void onError(Context arg0, String errorId)
  {
    gcmHelper.onError(arg0, errorId);
  }

  @Override
  protected boolean onRecoverableError(Context context, String errorId)
  {
    gcmHelper.onRecoverableError(context,errorId);
    return super.onRecoverableError(context, errorId);
  }
  
  @Override
  protected String[] getSenderIds (Context context)
  {
    return new String[]{GCMIntentServiceHelper.getSenderID()};
  }
}