const { SlashCommandBuilder } = require('discord.js');
const { grade1, grade2, grade3, grade4 } = require('../../config.json');

const gradeList = {
	'grade1': grade1,
	'grade2': grade2,
	'grade3': grade3,
	'grade4': grade4,
};

const higherPermissionUser = [];
for (let i = 0; i <= roleMember.length - 1; i++) {
	const userRole = [];
	await interaction.guild.members.fetch(roleMember[i]).then(member => member.roles.cache.forEach(role => {
		// 取得したユーザーの全role id get!
		userRole.push(role.id);
	}));
	let gradeTag = '';
	if (userRole.includes(grade1)) gradeTag = '[B1]';
	if (userRole.includes(grade2)) gradeTag = '[B2]';
	if (userRole.includes(grade3)) gradeTag = '[B3]';
	if (userRole.includes(grade4)) gradeTag = '[B4]';
	await interaction.guild.members.fetch(roleMember[i]).then(async member => {
		const username = member.displayName.replace(/\[\w*\]/giu, '');
		try {
			await member.setNickname(gradeTag + username);
		}
		catch (err) {
			higherPermissionUser.push(roleMember[i]);
		}
	});
}
if (higherPermissionUser.length !== 0) {
	await interaction.followUp({ content: `:warning:Caution!:warning:\n<@${higherPermissionUser.join('>\n<@')}>\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`, ephemeral: true });
	console.log(`----------\nCaution!\n${higherPermissionUser.join('\n')}\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update_gradeTag')
		.setDescription('特定のロール/個人の人の学年表示を更新します')
}