1. <a ng-click="scrollTo('1')">Error messages</a>
    1. <a ng-click="scrollTo('1-1')">Form validation error messages</a>
        1. <a ng-click="scrollTo('1-1-1')">Best practices</a>
        2. <a ng-click="scrollTo('1-1-2')">Input box empty</a>
        3. <a ng-click="scrollTo('1-1-3')">Length exceeds the maximum number of characters</a>
    2. <a ng-click="scrollTo('1-2')">General error messages</a>
        1. <a ng-click="scrollTo('1-2-1')">Best practices</a>
        2. <a ng-click="scrollTo('1-2-2')">Known errors</a>
        3. <a ng-click="scrollTo('1-2-3')">Unknown errors</a>
2. <a ng-click="scrollTo('2')">Warning/Confirmation messages</a>
    1. <a ng-click="scrollTo('2-1')">General warning messages (with action needed)</a>
    2. <a ng-click="scrollTo('2-2')">File name warning messages (with no action needed)</a>
        1. <a ng-click="scrollTo('2-2-1')">Illegal characters</a>
        2. <a ng-click="scrollTo('2-2-2')">Name cannot be empty</a>
        3. <a ng-click="scrollTo('2-2-3')">Length of the name limitation</a>
        4. <a ng-click="scrollTo('2-2-4')">Name already exists</a>
    3. <a ng-click="scrollTo('2-3')">Delete confirmation messages</a>
        1. <a ng-click="scrollTo('2-3-1')">Delete a file confirmation message</a>
        2. <a ng-click="scrollTo('2-3-2')">Delete a folder confirmation message</a>
3. <a ng-click="scrollTo('3')">Success messages</a>
    1. <a ng-click="scrollTo('3-1')">Best practices</a>
    2. <a ng-click="scrollTo('3-2')">Example wording</a>
    
<br />  
  
### 1. <span id="1">Error messages</span> 
#### 1.1 <span id="1-1">Form validation error messages</span>
#### 1.1.1 <span id="1-1-1">Best practices: Use inline validation, don't use pop-up dialogue.</span>

<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-5">
        <h2 class="text-success">✔</h2>
        <img src="docs/assets/right-inline-validation.png" style="width:100%;" />
    </div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-5">
        <h2 class="text-danger">✖</h2>
        <img src="docs/assets/wrong-pop-up-validation.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="1-1-2">1.1.2 Input box empty</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Please specify the search criteria."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-10">
        <img src="docs/assets/input-box-empty.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="1-1-3">1.1.3 Length exceeds the maximum number of characters</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The length of the tag cannot exceed 64 characters."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/length-exceeds-maximum.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="1-1-4">1.1.4 Name already exists</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The vendor name already exists."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/name-already-exists.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="1-2">1.2 General error messages</span>
#### <span id="1-2-1">1.2.1 Best practices</span>
* First, need to tell the user what is the **impact** (failed to log in to the device)
* Secondly, need to tell the user the **reason** (SSH connect to device timed out)
* Lastly, need to tell the user what he **needs to do next**, if any (please reactivate the license). 
<br />

#### <span id="1-2-2">1.2.2 Known errors</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Your license has been deactivated! The license signature returned doesn’t match with the original one. Please reactivate your license."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/known-errors.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="1-2-3">1.2.3 Unknown errors</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Failed to delete the Visual Space due to unknown error!  Please try again later."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/unknown-errors.png" style="width:100%;" />
    </div>
</div>
<br />

### <span id="2">2. Warning/confirmation messages</span>
#### <span id="2-1">2.1 General warning messages, with actions</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The Data View Group name already exists! Do you want to merge the two Data View Groups?"</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/general-warning-messages.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-2">2.2 File name warning messages, with no action needed</span>
#### <span id="2-2-1">2.2.1 Illegal characters</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The Visual Space name cannot contain any of the following characters:  \\/:*?"<>|.$"</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/illegal-chars.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-2-2">2.2.2 Name cannot be empty</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The Visual Space name cannot be empty."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/name-cannot-be-empty.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-2-3">2.2.3 Length of the name limitation</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The length of the Visual Space name cannot exceed 128 characters."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/name-length-limitation.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-2-4">2.2.4 Name already exists</span>

<div class="row">
    <div class="col-xs-12">
        <i>"The folder name already exists."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/name-already-exists-warning.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-3">2.3 Delete confirmation messages</span>
#### <span id="2-3-1">2.3.1 Delete a **file** confirmation message</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Are you sure you want to delete this Visual Space?"</i>
        <ul>
            <li>It is better to use clear action button, instead of just simple Yes/No</li>
            <li>Better use this component <a ui-sref="home.modal">Customized Alert Dialogue</a></li>
        </ul>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/delete-file-confirmation.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="2-3-2">2.3.2 Delete a **folder** confirmation message</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Are you sure you want to delete this folder? All its sub-folders and visual spaces included will be deleted."</i>
        <ul>
            <li>It is better to use clear action button, instead of just simple Yes/No</li>
            <li>Better use this component <a ui-sref="home.modal">Customized Alert Dialogue</a></li>
        </ul>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <img src="docs/assets/delete-folder-confirmation.png" style="width:100%;" />
    </div>
</div>
<br />

### <span id="3">3. Success messages</span>
#### <span id="3-1">3.1 Best practices</span>
* Use <a ui-sref="home.toastr">Toastr component</a> (disappear by itself, and no need to close)
* Do not use pop-up notification message.

<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-5">
        <h2 class="text-success">✔</h2>
        <img src="docs/assets/right-success-message.png" style="width:100%;" />
    </div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-5">
        <h2 class="text-danger">✖</h2>
        <img src="docs/assets/wrong-success-message.png" style="width:100%;" />
    </div>
</div>
<br />

#### <span id="3-2">3.2 Example wording</span>

<div class="row">
    <div class="col-xs-12">
        <i>"Successfully duplicated the Visual Space."</i>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-4">
        <img src="docs/assets/success-message-example.png" style="width:100%;" />
    </div>
</div>
<br />