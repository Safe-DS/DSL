# Problem mit .svg Dateien

Bei der Verwendung von .svg Dateien besteht das Problem, dass es sich hier um assets handelt, die, wenn sie auf die typische Art und Weise in den Webview mit eingebunden werden würden, vom Extension Prozess signiert werden müssten.

## Lösungsansatz

Die svgs werden als .svelte Dateien abgespeichert und als Komponenten behandelt. Diese werden dann über eine zentrale Komponente zugänglich gemacht, um dynamisch die korrekte SVG Komponente auswählen zu können.

## Verwendung

Diese Komponente muss mit dem Namen der SVG Komponente konfiguriert werden.

```svelte
<script lang="ts">
    import CategoryIcon from 'assets/category/categoryIcon.svelte'
</script>

<div>
    <CategoryIcon name={"Svg Name"}>
</div>
```

## Theming
Beim Hinzufügen neuer SVG's ist darauf zu achten, dass das bisher verwendete Theming beibehalten wird. So wird die Farbe via stroke-color definiert. Es sind daher alle hardkodierten Benennungen von stroke-color zu entfernen. Sollte ein SVG eine fill Farbe verwenden, so muss diese auf "currentColor" gesetzt werden. Auf diese Weise gleicht sich die fill-color automatisch der stroke-color an. Es muss außerdem className als prop übergeben werden um das externe Styling zu ermöglichen.
