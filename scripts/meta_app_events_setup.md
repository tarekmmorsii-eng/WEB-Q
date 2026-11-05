# Meta App Events — token configured locally, activation pending

App ID: `2583102655453800`. Android package: `com.mushafalmurajaa.app`.

The Gradle dependency `com.facebook.android:facebook-core:19.0.0` is conditional on
`-PmetaEventsEnabled=true` (default false). While disabled the SDK is not packaged,
the generated client-token resource is empty, and automatic initialization/logging
are false. No manual activate-app event was added to MainActivity.

The owner supplied the Client Token on 2026-10-23. It is stored in the ignored
`android/meta-events.local.properties` file under `META_CLIENT_TOKEN`.
The build environment variable `META_CLIENT_TOKEN` overrides this local fallback.
Enable the integration for the future authorized build with `-PmetaEventsEnabled=true`.
No Android package was built and the default remains disabled. Missing/invalid token
fails configuration when enabled. The token becomes an Android string resource;
it is not an App Secret and will be present in the installed app.

Before activation:
- Verify Android platform/package and signing key hashes in this Meta app.
- Verify App Events settings and advertising-account access in Meta's dashboard.
- Review privacy disclosure/consent and advertising ID collection requirements.
  Advertiser ID collection is currently false; decide explicitly before campaign validation.
- The beta flavor has package `com.mushafalmurajaa.app.beta`: configure that separately
  if used for Meta testing; do not assume it matches the production registration.
- Resolve the pinned SDK and inspect merged manifest/dependency compatibility.
- On an authorized device build, verify first launch/install and subsequent activation
  in Meta Events Manager, without manually duplicating `fb_mobile_activate_app`.
- Confirm campaign attribution separately; receiving events alone does not prove attribution.

No APK/AAB was created and no device events were sent. Dashboard changes are recorded below.
SDK dependency resolution and on-device event verification remain pending.

References:
- https://github.com/facebook/facebook-android-sdk#installation
- https://github.com/facebook/facebook-android-sdk/releases/tag/sdk-version-19.0.0

## Dashboard review — 2026-10-23
- Confirmed App ID, Client Token, package com.mushafalmurajaa.app and MainActivity match local configuration.
- Existing App Install Ads use case and one approved ad account are present.
- Changed Facebook SDK automatic event logging from Unspecified to On, saved, and confirmed On after reload.
- Key hashes field appears empty. App remains unpublished; linked business portfolio is marked unverified. No publishing or verification was attempted.
- Android purchase logging was already enabled and left unchanged. iOS and security settings were not changed.
- No device events or attribution verified. Local SDK packaging remains disabled by default until authorized build.
- Feedback deployment and account identification subsequently completed; see feedback_setup.md (24 October).

## Local review — 2026-10-24
- Dependency inspection was attempted without packaging Android, but Gradle failed before configuration because C:\.gradle was not writable. The required 8.14.3 wrapper is not in the available user cache; dependency compatibility remains unverified.
- public/privacy.html currently has no Meta/Facebook disclosure. Prepare this before public activation.
- 35 related local tests and the Vite build passed. These do not validate Android SDK initialization or campaign attribution.
- Follow-up order and deferred device checks: pre_tajweed_review.md.


## Completed follow-up — 2026-10-24
Gradle 8.14.3 now runs using workspace-local caches. Both standardReleaseRuntimeClasspath resolution and processStandardReleaseMainManifest succeeded with metaEventsEnabled=true; no APK/AAB was produced. See artifacts/meta-dependencies-review.txt and artifacts/meta-manifest-review.txt. Native compilation and on-device behavior remain untested.

Merged manifest retains AdvertiserIDCollectionEnabled=false but inherits AD_ID and three ACCESS_ADSERVICES permissions from dependencies. Resolve the permission/consent policy before release; do not infer zero identifier collection from this flag alone.

The Google Play signing certificate was retrieved and its SHA-256 matched the console. See meta_signing_review.md for the public Meta hash and correct Play account. Registration in Meta is still pending. Privacy draft: privacy_meta_draft.md (not published).

## Permission implementation — 2026-10-24
Removed inherited AD_ID, ACCESS_ADSERVICES_AD_ID, ACCESS_ADSERVICES_CUSTOM_AUDIENCE and ACCESS_ADSERVICES_TOPICS using manifest merger removal markers. Kept ACCESS_ADSERVICES_ATTRIBUTION for measurement and AdvertiserIDCollectionEnabled=false. Enabled/default-disabled manifest tasks both passed, with assertions confirming removed permissions and retained provider when enabled, and absent provider/AutoInitEnabled=false by default. No APK/AAB produced. Attribution quality and runtime behavior still require device verification; do not equate permission reduction with no tracking.
