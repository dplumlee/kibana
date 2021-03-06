<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-public](./kibana-plugin-public.md) &gt; [App](./kibana-plugin-public.app.md)

## App interface

Extension of [common app properties](./kibana-plugin-public.appbase.md) with the mount function.

<b>Signature:</b>

```typescript
export interface App extends AppBase 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [chromeless](./kibana-plugin-public.app.chromeless.md) | <code>boolean</code> | Hide the UI chrome when the application is mounted. Defaults to <code>false</code>. Takes precedence over chrome service visibility settings. |
|  [mount](./kibana-plugin-public.app.mount.md) | <code>(context: AppMountContext, params: AppMountParameters) =&gt; AppUnmount &#124; Promise&lt;AppUnmount&gt;</code> | A mount function called when the user navigates to this app's route. |

