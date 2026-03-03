# Presentation

SlashDoc is a digital documentation platform for archiving, structuring, and sharing knowledge from design research projects.

It documents processes across artistic, scientific, craft, and design practices.

**Audience:** designers and researchers.  
**Values:** open source, digital sobriety, independence from third-party services, and a lightweight, sustainable architecture.

SlashDoc was created by Atelier LUMA, Louis Eveillard (L’Atelier des Chercheurs) and Thibery Maillard.
It is based on do•doc: https://github.com/l-atelier-des-chercheurs/dodoc

# License

SlashDoc is free and open source.
The code is licensed under AGPLv3, and the graphic assets (icons, pictograms, user interface) are under a CC-BY-SA license.

# Branches

- **main** --> default branch, latest stable version. Used on LUMA server.

- **dev** --> in-progress

# Installation

## The docker compose way

Installation on a dedicated server (such as a VPS) is highly recommended.
You need to have `docker` installed on your machine.

Run `docker compose up -d`, wait for it to initialize completely, and visit `https://localhost:8080`.
Your data is persistent (in ./slashdoc-data directory).

## Or the docker manual way

If you prefer to customise the container, the basic pattern for starting a SlashDoc instance is:

```
$ docker run --name slashdoc -p 8080:8080 -v ./slashdoc-data:/home/node/Documents -d ghcr.io/l-atelier-des-chercheurs/slashdoc:latest
```

Your data is persistent (in ./slashdoc-data directory).
Then, access it via `https://localhost:8080`.

# After installation

When starting the app for the first time, a message will tell you about an admin account that is created by default. Its password is "slashdoc". Connect to this account by clicking the "Login" button in the top right and change the password by opening that account's page and clicking Options, and editing the password field. It is recommended to open the admin settings afterwards (the gear icon in the top bar) and read/adapt all settings.

# How the core works

Everything is structured in folders/files, so as to mirror the content in the filesystem. No relational database is used, almost all the content are saved in the content folder (by default /Documents/slashdoc).

Folders contain a meta.txt file and media files (images, videos, audios, 3D/stl, texts, or any other kind of files).

## Properties and values

### Folders

Default values are:

```
- $admins           (Array, editable)                     list of admins paths
- $contributors     (Array, editable)                     list of contributors paths
- $cover            (Object, editable)                    if a meta_cover.jpeg is present in the root of the folder
- $preview          (String, editable)                    if set, search for a meta filename in this folder and read it when reading folder (useful for advanced cover of this folder)
- $date_created     (Date)                                when the folder was created
- $date_modified    (Date)                                when the folder was last edited
- $files_count      (Number)                              number of files in that folder
- $folders_count    (Number)                              total count of content folders across all subfolder types (e.g., for a space: number of projects; for a project: total of publications + makes + stopmotions)
- $date_last_file   (Date)                                when the last file was uploaded
- $files            (Array)                               list of all the files in this folder (see Files below) (bypass with no_files=true to improve performance where files are not needed)
- $status           (String, editable)                    determines whether the folder gets listed
- $public           (Boolean, editable)                   if true, return that folder, its files, and its source medias even when request is not auth
- $password         (String, editable, stored as hash)    limit editing to users with password
- $path             (String)                              path to folder, matches filesystem structure and URL
- $infos            (Object)                              data gathered from the folder itself (only available when url is appended with ?detailed=true)
  - size            (Number)                              size in bytes
```

Custom values can be defined in the schema property in settings_base.json.
Editable default values and all custom values can only be edited by an $admin.

### Files

Each file has default values and custom values as well.
Default values are:

```
- $admins           (Array, editable)                     list of admins paths (will be used to set file permissions in the future)
- $contributors     (Array, editable)                     list of contributors paths (will be used to set file permissions in the future)
- $authors          (Array, editable)                     list of authors paths (information only, not actually used server-side)
- $path             (String)                              path to meta text file, matches filesystem structure and URL
- $date_created     (Date)                                when the file was created
- $date_uploaded    (Date)                                when the file was uploaded
- $date_modified    (Date)                                when the file was last edited
- $media_filename   (String, editable)                    name of the file
- $type             (String, editable)                    type of media file among the following: _image, video, audio, stl, text, pdf, other_
- $status           (String, editable)                    determines whether the file gets listed when getFiles is called by non-authors
- $origin           (String, editable)                    used to indicate the origin of the media (capture page, upload, etc.)
- $processing        (Array, editable)                    used to list processing applied to media (blurred, cropped, resized, etc.)
- $thumbs           (object)                              list of possible media image thumbs
- $content          (String, editable)                    text content of a file
- $credits          (String, editable)                    Credits for media
- $location         (Object, editable)                    GPS location for file
- $infos            (object)                              data gathered from the file itself
  - mtimems         (Date)                                last modified time for media file
  - duration        (Number)                              for videos and audios
  - width           (Number)                              for images and videos
  - height          (Number)                              for images and videos
  - ratio           (Number)                              for images and videos
  - size            (Number)                              size in bytes
  - gps             (Object)
  - hash            (String)                              file hash (to find duplicates)
```

Custom values can be defined in the schema property in settings_base.json.
Editable default values and all custom values can only be edited by an $admins.

## Security and visibility

### Status

Each folder has a "$status" property, which defines who can read them using getFolders, getFolder:

- by default, it is set to **private**: folder will only be listed by their respective authors and instance admins.
- otherwise, if set to anything else, they will be listed by anyone (loggedin or not, as long as they have access to dodoc)

### Password

If a folder has a $password, then this ressource and its content can only be edited by people that are logged in to this folder using its password.

### Editing

If a folder has $admins, only people logged in with a token that matches one of these $admin path can edit/remove this folder's meta and its subfolders.

If a folder has $contributors, people logged in with a token that matches one of these $contributors can not edit this folder's meta but can create/edit/remove subfolders or import/edit/remove files.

If a folder has `$contributors = "everyone"`, all users (including anonymous, non logged-in users) have contributors' permissions.
If a folder has `$admins = "everyone"`, all users (including anonymous) have admins' permissions.
If a folder has `$admins = "parent_contributors"` then all parent's $contributors are admins to this folder. This is the same behaviour as files in that parent folder.
If a folder has `$admins = "authors"` then all logged in authors are admins to this folder (anonymous contributions are forbidden).

These permissions trickle down: an instance admin has admin rights to all the instance contents. A community (called folders in schema) admin has admin rights to all its content.

An instance contributor, though, only has contributors rights to the direct content it contains. For instance, a contributor to a space can create a project, but not remove a project he/she is not an $admin of.

If a folder type schema has the property `$can_be_created_by: "everyone"`, this overrides the above behaviour and such folder can be created by all users even those that are not logged in. This is useful for accounts creation.

## Examples

### Schema and path

The path to a ressource is decomposed like this:

`/type-of-ressource/name-of-ressource/type-of-child-ressource/name-of-child-ressource`

For example, with the following schema:

```
{
  "schema": {
    "$folders": {
      "spaces": {
        "$cover": {
          "width": 1200,
          "height": 1200,
          "thumbs": {
            "resolutions": [50, 320, 640, 1200]
          }
        },
        "fields": {
          "title": {
            "type": "string"
          }
        },
        "$folders": {
          "projects": {
            "$cover": {
              "width": 2000,
              "height": 2000,
              "thumbs": {
                "resolutions": [50, 320, 640, 2000]
              }
            },
            "fields": {
              "title": {
                "type": "string",
                "unique": true
              }
            },
            "$folders": {
              "publications": {
                "$cover": {
                  "width": 1200,
                  "height": 1200,
                  "thumbs": {
                    "resolutions": [50, 320, 640, 1200]
                  }
                },
                "fields": {
                  "title": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Then the following routes will redirect to:

- /folders
  --> returns an array of all folders in /folders with their metas

- /folders/bonjour
  --> returns an object of the meta informations of a single "bonjour" folder with a list of all their files with their metas

- /folders/bonjour/stacks
  --> returns an array of all stacks in /folders/bonjour/stacks with their metas

- /folders/bonjour/stacks/elephant-with-plywood
  --> returns an object of the meta of this stack

### Permission

For an existing folder:

```
Role                  | Edit | Upload file | Create subfolder | Export | Copy |  Download | GeneratePreview |
-------------------------------------------------------------------------------------------------------------
Instance admins       |   x  |     x       |        x         |    x   |   x  |     x     |        x        |
Folder $admins        |   x  |     x       |        x         |    x   |   x  |     x     |        x        |
Folder $contributors  |      |     x       |        x         |        |      |           |                 |
-------------------------------------------------------------------------------------------------------------
```

So, for example for a folder /bonjour, its $admins can edit all meta properties while a contributor can only import/edit/remove stacks.

---

## Cookies / LocalStorage

Data stored in the LocalStorage (similar to cookies) :

- sessionID: random identifier to persist connection
- general_password: access password for dodoc if set for that instance, and if "remember" is checked
- tokenpath: login identifier, to reconnect to a logged in account when the page is refreshed
- selected_devices: selected video/audio devices in Capture page
- location_to_add_to_medias: coordinates picked to add to captured media
- fontLastUsed: last font used in a text block
- language: lang picked by user if it was changed from the default (browser or OS langage)
- translations_to_share: when using the translation helper, translations entered by a user
- show_meta_sidebar: show/hide the information sidebar when opening the modal for a media in Collect
- library_tile_mode: last used media preview mode in Collect
- page_settings: for each publication, remember grid options (show/hide, snap, gridstep)

## Logging

All API calls (getting content, creating folders, etc.) are logged in a "journal" folder, in the content folder. Each run of the app is stored in a JSONL file named with the timestamp it was created. Each line in this file logs the timestamp, the user who requested it, from what kind of device, the ip address, and if the call was successull or not.

Only instance admins can load logging files from the app.

These logs contain both general app-related events (like which version of node.js is running, is there any settings.json environment specific files) and specific content related.
