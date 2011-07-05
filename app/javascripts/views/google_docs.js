(function () {
  // As search results come back when filtering results add them in place of the current list
  document.on('ajax:success', '.google_docs .search_form form', function(e, form) {
    form.up('.google_docs').down('.google_docs_list').replace(e.memo.responseText);
  });

  // Once the call to make a new document has been made we must add it to the list of documents
  document.on('ajax:success', '.google_docs .create_google_document_form form', function(e, form){
    var doc = e.memo.responseText.evalJSON(true);
    addGoogleDocToForm(function(field_name){
      return doc[field_name];
    });
    form.down('#google_doc_title').clear();
  });

  var GoogleDocs = { 
      className: 'google_docs_attachment'
    , template: Teambox.modules.ViewCompiler('partials.google_docs')
  };

  /*
  * TODO: Maintain checkbox states
  * TODO: Once google docs is API'd change google doc search/create forms to backbone
  GoogleDocs.events = {
    'change .google_docs input[type="checkbox"]': 'addOrRemoveGoogleDoc'
  };

  GoogleDocs.initialize = function (options) {
    _.bindAll(this, "render");
    options = options || {};

    this.comment_form = options.comment_form;
  };

  /* Render google docs area
   */
  GoogleDocs.render = function () {
    this.el.update(this.template());

    return this;
  };

  /* Show list of docs in facebox div
   */
  GoogleDocs.openGoogleDocsList = function (event) {
    var link = $(event.target).up('a');

    event.preventDefault();

    Facebox.setElement(this.el.down('.facebox'));
    Facebox.openUrl(link.getAttribute('href'), link.getAttribute('title'));
  };

  /* Handles checkbox changes and adds/removes docs to form appropriately
   */
  GoogleDocs.addOrRemoveGoogleDoc = function (event) {
    var checkbox = $(event.target);

    if (checkbox.checked){
      this.addGoogleDocToForm(function(field_name){
        var data_field_name = 'data-' + field_name.gsub('_', '-');
        return checkbox.readAttribute('data-' + field_name.gsub('_', '-'));
      });
    }
    else {
      this.removeGoogleDocFromForm(checkbox.readAttribute('data-document-id'));
    }
  };


  /* Removes a google doc entry from form
   */
  GoogleDocs.removeGoogleDocFromForm = function (data_id){
    var selector = '[data-gform="' + data_id + '"]';
    this.el.select(selector).each(function(element){
      element.remove()
    })
  };

  /* Adds a google doc entry from form
   */
  GoogleDocs.addGoogleDocToForm = function (fn) {
    // Find the various elements we are going to interact with
    var form_area = this.el.down('.google_docs_attachment_form_area')
    , getFormValue = fn
    , prefix = form_area.readAttribute('data-object-name')
    , previous_field = form_area.select('input').last();

    // Find the last number in a string - adapted from increment last number as we have many fields
    var findLastNumber = function(string){
      var matches = string.match(/\d+/g);
      return parseInt(matches.last());
    };

    // Work out the last field number and add one to it
    var field_number = previous_field ? findLastNumber(previous_field.readAttribute('name')) + 1 : 0;

    // For each of the data attributes create a hidden field
    var fields = ['document_id', 'title', 'url', 'document_type', 'edit_url', 'acl_url']
    fields.each(function(field_name){
      var newInput = new Element('input', {
        type: 'hidden',
        name: prefix + '[google_docs_attributes][' + field_number + '][' + field_name + ']',
        value: getFormValue(field_name),
        'data-gform': getFormValue('document_id')
      })

      form_area.down('.fields').insert(newInput)
    });

    // Add details about this document to the document list
    var title = getFormValue('title')
    , doc_type = getFormValue('document_type')
    , url = getFormValue('url')
    , gid = getFormValue('document_id')
    , image = '<img src="/images/google_docs/icon_6_' + doc_type + '.gif" />'
    , image_span = '<span class="file_icon google_icon">' + image + '</span>'
    , link = '<span class="filename"><a href="' + url + '">' + title + '</a></span>';

    form_area.down('.file_list').insert('<li data-gform="' + gid  + '">' + image_span + link + '</li>')
  };


  // exports
  Teambox.Views.GoogleDocs = Backbone.View.extend(GoogleDocs);
}());
