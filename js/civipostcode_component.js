jQuery(document).ready(function ($) {
  var civiPostCodeLookupProvider = Drupal.settings.civiPostCodeLookupProvider;
  var civiPostCodeFields = Drupal.settings.civiPostCodeFields;
  var sourceUrl = Drupal.settings.baseUrl + "/civicrm/" + civiPostCodeLookupProvider + "/ajax/search?json=1";
  $.each(civiPostCodeFields, function (key, value) {
    if ($('[id*="'+value+'"]').length) { // Check postcode element exists on page first
      $('[id*="' + value + '"]').on('keyup', function (event) {
        // Simple regex for postcode structure checking, without complexity of checking for allowable letters
        // See https://stackoverflow.com/questions/164979/regex-for-matching-uk-postcodes for more!
        var regex = new RegExp('^([A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?[ ]?)([0-9]{1}[A-Za-z].*)');
        // Check entry up to penultimate character, to allow autocomplete to work after final char
        if(regex.test($('[id*="' + value + '"]').val()))
        {
          $('[id*="' + value + '"]').autocomplete( "option", "disabled", false );
        }else
        {
          $('[id*="' + value + '"]').autocomplete( "option", "disabled", true );
        }
      });
      $('[id*="' + value + '"]').autocomplete({
        source: sourceUrl,
        minLength: 3,
        select: function (event, ui) {
          var id = ui.item.id;
          var sourceUrl = Drupal.settings.baseUrl + '/civicrm/' + civiPostCodeLookupProvider + '/ajax/get?json=1';
          var postcodeElementId = value;
          var result = getCivicrmAndContactSequence(postcodeElementId);

          $.ajax({
            dataType: 'json',
            data: {id: id},
            url: sourceUrl,
            success: function (data) {
              setAddress(data.address, result.civicrmSeq, result.contactSeq);
            }
          });
          return false;
        },
        //optional (if other layers overlap autocomplete list)
        open: function (event, ui) {
          // show scrollbar
          jQuery(".ui-autocomplete").css({
            'overflow-y': 'auto',
            'max-height': '200px',
            'z-index': '1000',
          });
        }
      });
    }
  });

  // extract civicrm and contact sequence to form id
  function getCivicrmAndContactSequence(str) {
    var splittedIdArray = str.split('-');
    var previousValue = "";
    var result = [];

    $.each(splittedIdArray, function (index, value) {
      if (previousValue == 'civicrm') {
        result['civicrmSeq'] = value;
      }
      if (previousValue == 'contact') {
        result['contactSeq'] = value;
      }
      previousValue = value;
    });
    return result;
  }

  // fill address in respective fields
  function setAddress(address, civicrmSeq, contactSeq) {
    var streetAddressElement = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-street-address";
    var AddstreetAddressElement = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-supplemental-address-1";
    var AddstreetAddressElement1 = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-supplemental-address-2";
    var AddstreetAddressElement2 = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-supplemental-address-3";
    var cityElement = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-city";
    var postalCodeElement = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-postal-code";
    var countyElement = "civicrm-"+civicrmSeq+"-contact-"+contactSeq+"-address-state-province-id";

    $('[id *="' + streetAddressElement + '"]').val(address.street_address);
    $('[id *="' + AddstreetAddressElement + '"]').val(address.supplemental_address_1);
    $('[id *="' + AddstreetAddressElement1 + '"]').val(address.supplemental_address_2);
    $('[id *="' + AddstreetAddressElement2 + '"]').val(address.supplemental_address_3);
    $('[id *="' + cityElement + '"]').val(address.town);
    $('[id *="' + postalCodeElement + '"]').val(address.postcode);
    $('[id *="' + countyElement + '"]').val(address.state_province_abbreviation);
  }
});
