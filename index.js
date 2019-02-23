import Cookie from 'js-cookie';

export default function ({ Config, State, $document, jQuery, LoadScreen, LZString, stateUrlPath }) {

	// Take form SugarCube 2 src/save
	function sateMarshal(supplemental) {

		if (supplemental != null && typeof supplemental !== 'object') { // lazy equality for null
			throw new Error('supplemental parameter must be an object');
		}

		const saveObj = {
      ...supplemental,
			id    : Config.saves.id,
			state : State.marshalForSave()
		};

		if (Config.saves.version) {
			saveObj.version = Config.saves.version;
		}

		if (typeof Config.saves.onSave === 'function') {
			Config.saves.onSave(saveObj);
		}

		// Delta encode the state history and delete the non-encoded property.
		saveObj.state.delta = State.deltaEncode(saveObj.state.history);
		delete saveObj.state.history;

		return saveObj;
  }

	// Take form SugarCube 2 src/save
  function ajaxAutosaveSave(metadata = null) {

		if (typeof Config.saves.isAllowed === 'function' && !Config.saves.isAllowed()) {
			return null;
		}

		const supplemental = metadata == null ? {} : { metadata }; // lazy equality for null

    const autosave = LZString.compressToBase64(JSON.stringify(sateMarshal(supplemental)));

    return autosave;
  }

	// Lock the screen until we can confirm if there's a save to load form server
	const lockId = LoadScreen.lock();
	LoadScreen.init();

  const ajaxSave = () => {
		const data = ajaxAutosaveSave();

    jQuery.ajax({
      url: stateUrlPath,
      type: 'PUT',
			contentType: 'text/plain; charset=UTF-8',
			dataType: 'text',
      success: (result) => {
        // TODO - Do something to indicate saved
      },
      data,
    });

	};

	const isResetting = Cookie.get('sugarcube-engine-resetting');

	if(isResetting) {
		Cookie.remove('sugarcube-engine-resetting');
		LoadScreen.unlock(lockId);
		// Call even with null parameter, because nothing loaded
		jQuery.event.trigger(':ajaxsavestateloaded', null);
		$document.on(':passageend', ajaxSave);
	} else {
		jQuery.ajax({
			url: stateUrlPath,
			type: 'GET',
			dataType: 'text',
			success: (result, status, xhr) => {
				console.log(xhr.status);
				if(xhr.status === 204 || result === '') {
					// No save state!
					// Call even with null parameter, because nothing loaded
					jQuery.event.trigger(':ajaxsavestateloaded', null);
					return;
				}
				// Attempt to load saved data
				try {
					// Let's try to parse first, so if there's simply a parse error, we can catch it before SugarCube does
					JSON.parse(LZString.decompressFromBase64(result));
					Save.deserialize(result);
					jQuery.event.trigger(':ajaxsavestateloaded', result);
				} catch (ex) {
					jQuery.event.trigger(':ajaxsavestateloaderror', ex);
					// Could not load data.
					// TODO - something
				}
			},
			complete: (result, status) => {
				// Finally start saving, now that we've loaded
				LoadScreen.unlock(lockId);
				$document.on(':passageend', ajaxSave);
			},
		});
	}

	$document.on(':enginerestart', () => {
		Cookie.set('sugarcube-engine-resetting', 'true');
	});
}