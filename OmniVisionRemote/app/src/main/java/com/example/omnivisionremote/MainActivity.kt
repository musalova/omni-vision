package com.example.omnivisionremote

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        val settings = webView.settings
        
        // Abilita JavaScript e DOM storage
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        
        // Imposta webViewClient per restare in-app
        webView.webViewClient = WebViewClient()
        
        // Abilita cache/offline
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowContentAccess = true
        settings.allowFileAccess = true
        
        // Abilita installazione Service Worker (solo da Android 5+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // --- INTEGRAZIONE BRIDGE IR NATIVO ---
        // Esponiamo l'oggetto "AndroidIR" al codice JavaScript della PWA
        webView.addJavascriptInterface(IRBridge(this), "AndroidIR")

        // Carica l'URL della PWA
        webView.loadUrl("https://deft-chimera-7444a6.netlify.app/")

        // Gestisci il back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }
}
