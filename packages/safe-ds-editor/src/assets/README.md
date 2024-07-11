# Problem mit .svg Dateien

Bei der Verwendung von .svg Dateien besteht das Problem, dass es sich hier um assets handelt, die, wenn sie auf die typische Art und Weise in die Webview mit eingebunden werden würden, vom Extension Prozess signiert werden müssten.

## Lösungsansatz

Die Lösung die hier gefunden wurde ist, dass diese als .svelte Dateien abgespeichert und als Komponenten behandelt werden. Diese werden jeweils in Objekte gebündelt, wodurch der Wechsel zwischen verschiedenen Asset Gruppen (wie denen für Dark und Light mode) einfacher zu gestalten ist.

## Verwendung

Diese Asset Bündel können dann an entsprechender Stelle in Svelte Komponenten importiert werden und mittels des folgenden Syntax verwendet werden:

```typescript
<svelte:component
    this={categorysDark.evaluation}
    className="h-5 w-5"
/>
```

## Theming
Beim Hinzufügen neuer SVG's ist darauf zu achten, dass das bisher verwendete Theming beibehalten wird. So wird die Farbe via stroke-color definiert. Es sind daher alle hardkodierten Benennungen von stroke-color zu entfernen. Sollte ein SVG eine fill Farbe verwenden, so muss diese auf "currentColor" gesetzt werden. Auf diese Weise gleicht sich die fill-color automatisch der stroke-color an.