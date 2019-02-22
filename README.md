# Sugarcube 2 (Twine) Ajax Saving
This module implements auto saving/loading via ajax. It does not deal with the server side or authentication, it's up to you to implement that.

## Behavior
When your story loads, this module will make a simple GET request to the url `stateUrlPath` (parameter). If the repsonse is a text/plain save data, it will be passed to Sugarcube's `Save.unserialize()` to load the data. If this fails, nothing unordinary happens. The base saving system will take effect.

On the saving side, anytime a passage is loaded (ie whenever the normal autosave runs), this module will make a PUT request with the save state data to `stateUrlPath`.

## Installing and Loading
If using npm with Tweego/Twee, you can simply install with `npm i -S sugarcube-ajax-save`.
For Twine Desktop/Web... I'm not sure yet best approach for installing.

After installed, it needs to be loaded somewhere in your global js:
```
  import ajaxSaving from 'sugarcube-ajax-save';

  ajaxSaving({ Config, State, $document: $(document), jQuery, LoadScreen, LZString, stateUrlPath });
```

## Further Improvements
**Loading**
There may be a better standard for Twine/SugarCube modules.