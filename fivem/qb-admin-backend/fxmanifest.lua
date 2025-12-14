fx_version 'cerulean'
game 'gta5'

author 'Admin Panel Base'
description 'Unified admin panel backend with queue worker'
version '0.1.0'

shared_script 'shared/*.lua'
server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/*.lua',
  'server/handlers/*.lua'
}

lua54 'yes'
