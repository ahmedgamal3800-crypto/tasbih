package com.tasbeeh.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    companion object {
        const val PERMISSION_REQUEST_CODE = 1002
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()

        webView = WebView(this)
        setContentView(webView)

        configureWebView()
        requestNativePermissions()

        // Load Web App bundled assets or dev server URL
        // In release mode, loads from assets/index.html or hosted URL
        val appUrl = "https://ais-dev-rabaj4454s236gubbzhbn4-374155095125.europe-west2.run.app"
        webView.loadUrl(appUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = WebViewClient()

        // Expose Native Kotlin bridge to JavaScript React layer
        webView.addJavascriptInterface(AndroidAdhanBridge(this), "AndroidAdhanBridge")
    }

    fun requestNativePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    PERMISSION_REQUEST_CODE
                )
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = getSystemService(ALARM_SERVICE) as android.app.AlarmManager
            if (!alarmManager.canScheduleExactAlarms()) {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                startActivity(intent)
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
