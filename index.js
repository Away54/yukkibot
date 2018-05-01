const Discord = require("discord.js");
const YTDL = require("ytdl-core");

const TOKEN = "process.env.TOKEN";
const PREFIX = "!"

function GenerateHex() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function play(connection, message) {
    var server = servers[message.guild.id];

    servers.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) play(connection, message);
        else connection.disconect();
    });
}

var fortunes = [
    "Sim",
    "Não",
    "Talvez",
    "Que?"
];

var bot = new Discord.Client();

var servers = {};

bot.on("ready", function() {
    console.log("Ready");
});

bot.on("guildMemberAdd", function(member) {
      member.guild.channels.find("name", "general").sendMessage(member.toString() + "Bem-vindo à Slowly!");

      member.addRole(member.guild.roles.find("name", "Administrador"));

      member.guild.createRole({
          name: member.user.username,
          color: generateHex(),
          permissions: []
      }).then(function(role) {
          member.addRole(role);
      });
});

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()) {
        case "ping":
            message.channel.sendMessage("Pong!");
            break;
        case "info":
            message.channel.sendMessage("Eu sou apenas um bot, apenas.");
            break;
        case "Yukki":
            if (args[1]) message.channel.sendMessage(fortunes[Math.floor(Math.random() * fortunes.length)]);
            else message.channel.sendMessage("Não entendi.");
            break;
        case "help":
            var embed = new Discord.RichEmbed()
                .addField("Creator", "Away54", true)
                .addField("Comandos", "!oi - ele te da um 'oi' devolta\n!Ping - Ele manda um 'pong' devolta\n!info - ele fala algo inútil\n!Yukki - Você faz uma pergunta e ele te responde", true)
                .setFooter("Obs: Para mais comandos digite '!helpm' e se quiserem podem me recomendar algum comando.")
            message.channel.sendEmbed(embed);
            break;
        case "removerole":
           message.member.removeRole(message.guild.roles.find("name", "Adminstrador"));
           break;
        case "deleterole":
           message.guild.roles.find("name", "Adminstrador").delete();
           break;
        case "play":
            if (!args[1]) {
                message.channel.sendMessage("Providencie um link.");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.sendMessage("Você precisa estar em um canal de voz!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                 queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                 play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.channel.sendMessage("Comando inválido.");
     }
});

bot.login(TOKEN);
