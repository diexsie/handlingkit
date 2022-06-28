# Visual Coding upgrade strategy

## Why is project migration required?

From time to time new Visual Coding releases will introduce new features or API changes, which
will cause projects created with an earlier version of Visual Coding to be no longer compatible
with the recent version. PXT is shipped already with an update logic that covers only *.ts files and *.blocks ([see PXT docu](https://github.com/microsoft/pxt/blob/v6.1.19/common-docs/release-tests/upgrades.md)).
Moreover the builtin logic is only capable of applying regex replacements to the mentioned files,
which might get cumbersome to read and write. Therefore we decided to introduce our own update type
called "tigerPolicy".

## Where to define upgrade rules?

In the pxtarget.json the Visual Coding developers are specifing these update rules.
The following snippet shows a real example of an update rule:

```json
"compile": {
    "hasHex": false,
    "isNative": false,
    "saveAsPNG": true,
    "patches": {
      "0.0.1 - 1.15.0":[
          {
            "type": "tigerPolicy",
            "map": {
              "migration1500": "migrateAddUnits"
            }
          }
      ]
    }
  },
```
A rule consists of a namespace (migration1500), the name of a update routine (migrateAddUnits) and a version range (0.0.1 - 1.15.0). The version range provides information, when an update routine shall be executed. For example you have used Visual Coding 1.12.X to create a project. Then the .cloudheader.json will contain as a targetVersion the 1.12.X. When a user is opening this project with Visual Coding 1.15.X, the update routine will get executed. When the project compiles successfully after the update, the targetVersion in the .cloudheader.json is raised to 1.15.X.

The update routine is responsible to update all files, which require an update, so that they can be opened with the Visual Coding version specified at the end of the version rage. The implementation of the method needs to be done manually. The start of the version interval 0.0.1 was chosen by purpose, so that the migration does currently not run in our development environemt, where each Visual Coding build has the version 0.0.0.

Hint: It is still possible to define the upgrade rules intended by PXT.

## The phases of the upgrade process
Similar to the native PXT upgrade process our implementation is also running through several steps. This chapter
describes each phase:
1. Find out if a patch needs to be applied. Also several patches might need to be applied to
   upgrade to destination version.
2. Apply the patch (runs the update routine) and store the changes for temporary use.
3. Try to compile the project with the temporary changes.
4. Try to decompile the main.blocks from main.ts with the temporary changes. Recreation of main.blocks is required, because e.g. new FieldEditors are supported in newer versions.
5. If both steps (3. and 4.) succeeded, the temporary changes get applied to the project. If not
   the upgrade failed and the project is not touched.
6. In case of integration projects the targetVersion is updated as well. In case of tiger projects the
   app.applyUpgradesAsync() is taking care of this.

During the whole process you will get meaningfull log messages on the console.

## As a user of Visual Coding do I need to update anything manually?
No, the update process should run completley transparent for the user. The user can also import old
projects from png files or ctrlX and the upgrade strategy will take care. But the user should make sure
that the projects are compiling. If an update is considered as failed, because it did not compile after
the update it's likely it did not compile before as well. In this case fix the compilation issue and then
reopen the project.


## What is the upgrade rule migrateAddUnits doing?
From Tiger version 1.15.X (RM22.07 Release 17.07) kinematics and axis are supporting units. Additionally an axis can have the type linear or rotative. Due to these changes old projects will no longer compile with the upcoming Visual Coding version. The routine is adding default units to the configuration files motion-config.json and motion-instances.ts
and sets the type of each axis to 'linear' (in previous projects it was not possible to create a rotative axis).
To see which units are getting added by default, you can inspect the updated versions of [motion-config.json](https://github.com/treets/handlingkit/blob/master/motion-config.json) and [motion-instances.ts](https://github.com/treets/handlingkit/blob/master/motion-instances.ts).

## I'm using the embed.js and would like to make use of the upgrade process
When a new Visual Coding is released, the embed.js is also updated together with it. This means users
of the embed.js will also run into the problem, that previously created projects might not run with
recent Visual Coding versions.

The upgrade process can also be called by users of the embed.js. To make the process working certain
things need to be respected. The updated [index.html](https://github.com/treets/handlingkit/blob/master/index.html) shows exemplary how the update routine should be called and what cases need to be considred.

The follwing snippets show the relevant parts from index.html. The main upgrade routine to call is
named tiger.upgradeViaTigerPolicy. The next snippet shows how to use it:
```javascript
async function setupRunner(projectJson) {
    // ...omitted
    let targetVersion = JSON.parse(projectJson['.cloudheader.json']).targetVersion;

    // Legacy projects are missing the targerVersion. This is a trick so that the migration
    // process on the client still works for legacy projects.
    if (targetVersion === undefined) {
        targetVersion = "1.12.0";
    }

    pxt.runner.mainPkg._editorPkg = { files: projectJson, header: {targetVersion: targetVersion} }; //.setFiles(projectJson);
    await pxt.runner.mainPkg.installAllAsync();

    // Newer Tiger versions might change existing blocks or configs. Call this to check for
    // outdated projects and in case peform an update. E.g. from Tiger version 1.15.X kinematics
    // and axis are supporting units and an axis can have the type linear or rotative.
    let upgradeResult = await tiger.upgradeViaTigerPolicy();
    if (upgradeResult.success === true ) {
        // Persist updated project, so that it gets loaded again by loadProjects()
        await pxt.Cloud.privatePostAsync(JSON.parse(projectJson['.cloudheader.json']).id, projectJson, true).catch(handleError);
    }
    // omitted...
```

Additionally new projects MUST be created with a valid targetVersion in the .cloudheader.json.
If this is not done, projects created e.g. with Visual Coding version 1.16.X (includes already the unit feature), will get updated again. Integration developers do not need to care which version shall be written here, since the variable pxt.appTarget.versions.target is coming from embed.js and is therefore under control of Visual Coding developers.
```javascript
function newProject() {
    // ...omitted
    template[".cloudheader.json"].targetVersion = pxt.appTarget.versions.target
    // omitted...
```

If integration projects like to use tiger.upgradeViaTigerPolicy() for their base project, the cloudheader.json
of the base project must contain targerVersion:1.12.0, before calling tiger.upgradeViaTigerPolicy().
Instead of calling the upgrade method, it's also possible to add the necessary changes manually to motion-config.json and motion-instances.ts. These files have been updated in the github repo, so that you can identify their differences.
The files show up the same units like the migrateAddUnits update routine would add.



