fx_version 'cerulean'
game 'gta5'

author 'Admin Panel NUI'
description 'NUI frontend bridge'
version '0.1.0'

ui_page 'html/index.html'

files {
  'html/index.html',
  'html/assets/**/*'
}

client_scripts {
  'client.lua'
}

server_scripts {
  'server.lua'
}

lua54 'yes'
