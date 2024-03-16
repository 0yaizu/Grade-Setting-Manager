const { SlashCommandBuilder } = require('discord.js');
const { grade1, grade2, grade3, grade4 } = require('../../config.json');

// async function changeNickname(interaction, roleMember) {
// 	const higherPermissionUser = [];
// 	for (let i = 0; i <= roleMember.length - 1; i++) {
// 		const userRole = [];
// 		await interaction.guild.members.fetch(roleMember[i]).then(member => member.roles.cache.forEach(role => {
// 			// 取得したユーザーの全role id get!
// 			userRole.push(role.id);
// 		}));
// 		let gradeTag = '';
// 		if (userRole.includes(grade1)) gradeTag = '[B1]';
// 		if (userRole.includes(grade2)) gradeTag = '[B2]';
// 		if (userRole.includes(grade3)) gradeTag = '[B3]';
// 		if (userRole.includes(grade4)) gradeTag = '[B4]';
// 		await interaction.guild.members.fetch(roleMember[i]).then(async member => {
// 			const username = member.displayName.replace(/\[\w*\]/giu, '');
// 			try {
// 				await member.setNickname(gradeTag + username);
// 			}
// 			catch (err) {
// 				higherPermissionUser.push(roleMember[i]);
// 			}
// 		});
// 	}
// 	if (higherPermissionUser.length !== 0) {
// 		await interaction.followUp({ content: `:warning:Caution!:warning:\n<@${higherPermissionUser.join('>\n<@')}>\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`, ephemeral: true });
// 		console.log(`----------\nCaution!\n${higherPermissionUser.join('\n')}\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`);
// 	}
// }

const higherPermissionUser = [];
async function changeNickname(interaction, userId) {
	const userRole = [];
	await interaction.guild.members.fetch(userId).then(member => member.roles.cache.forEach(role => {
		// 取得したユーザーの全role id get!
		userRole.push(role.id);
	}));
	let gradeTag = '';
	if (userRole.includes(grade1)) gradeTag = '[B1]';
	if (userRole.includes(grade2)) gradeTag = '[B2]';
	if (userRole.includes(grade3)) gradeTag = '[B3]';
	if (userRole.includes(grade4)) gradeTag = '[B4]';
	await interaction.guild.members.fetch(userId).then(async member => {
		const username = member.displayName.replace(/\[\w*\]/giu, '');
		try {
			await member.setNickname(gradeTag + username);
		}
		catch (err) {
			higherPermissionUser.push(userId);
		}
	});
}

const gradeList = {
	'grade1': grade1,
	'grade2': grade2,
	'grade3': grade3,
	'grade4': grade4,
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('next_grade')
		.setDescription('特定の学年/個人を次の学年に切り替えます')
		.addSubcommand(subcommand => subcommand
			.setName('grade')
			.setDescription('特定の学年を次の学年に切り替えます')
			.addStringOption(option => option
				.setName('currentgrade')
				.setDescription('学年のロールを設定する')
				.setRequired(true)
				.addChoices(
					{ name: '1年', value: 'grade1' },
					{ name: '2年', value: 'grade2' },
					{ name: '3年', value: 'grade3' },
				),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('person')
			.setDescription('特定の個人を次の学年に切り替えます')
			.addUserOption(option => option
				.setName('user')
				.setDescription('個人のユーザーを指定する')
				.setRequired(true),
			),
		),
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
		let currentGrade = 0;
		let nextGrade = 0;
		if (subCommand === 'grade') {
			const roleMember = [];
			const choiceGrade = interaction.options.getString('currentgrade');
			if (choiceGrade == 'grade1') {
				currentGrade = grade1;
				nextGrade = grade2;
			}
			if (choiceGrade == 'grade2') {
				currentGrade = grade2;
				nextGrade = grade3;
			}
			if (choiceGrade == 'grade3') {
				currentGrade = grade3;
				nextGrade = grade4;
			}
			// cache更新(GuildMembers Intent必須)
			await interaction.guild.members.fetch();
			await interaction.guild.roles.fetch(gradeList[choiceGrade]).then(role => role.members.forEach(async member => {
				roleMember.push(member.user.id);
				await member.roles.add(interaction.guild.roles.cache.find(addRole => addRole.id == nextGrade));
				await member.roles.remove(interaction.guild.roles.cache.find(deleteRole => deleteRole.id == currentGrade));
				changeNickname(interaction, member.user.id);
			}));
			// log
			// role変更
			if (roleMember.length === 0) {
				await interaction.reply({ content: 'No users have roles for this grade.', ephemeral: true });
				console.log('No users have roles for this grade.');
			}
			else {
				await interaction.reply({ content: `success!\n<@${roleMember.join('>\n<@')}>\nthese user grade upgrated!`, ephemeral: true });
				console.log(`----------\ngrade upgrade success!\n${roleMember.join('\n')}\nthese user grade upgrated!`);
			}
			// nickname変更
			if (higherPermissionUser.length !== 0) {
				await interaction.followUp({ content: `:warning:Caution!:warning:\n<@${higherPermissionUser.join('>\n<@')}>\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`, ephemeral: true });
				console.log(`----------\nCaution!\n${higherPermissionUser.join('\n')}\nBot was unable to change nicknames for these users.\nMaybe, they have more permissions than bot.`);
			}
		}
		if (subCommand === 'person') {
			const user = interaction.options.getUser('user');
			// cache更新(GuildMembers Intent必須)
			await interaction.guild.members.fetch();
			const userRole = [];
			await interaction.guild.members.fetch(user.id).then(member => member.roles.cache.forEach(role => {
				// 取得したユーザーの全role id get!
				userRole.push(role.id);
			}));
			if (userRole.includes(grade1)) {
				currentGrade = grade1;
				nextGrade = grade2;
			}
			else if (userRole.includes(grade2)) {
				currentGrade = grade2;
				nextGrade = grade3;
			}
			else if (userRole.includes(grade3)) {
				currentGrade = grade3;
				nextGrade = grade4;
			}
			else if (userRole.includes(grade4)) {
				interaction.reply({ content: 'This user is already the highest grade!\ngraduation? Congratulations!', ephemeral: true });
			}
			else {
				await interaction.guild.members.fetch(user.id).then(member => member.roles.add(interaction.guild.roles.cache.find(role => role.id == grade1)));
				interaction.reply({ content: `This user does not have any grade roles, so gave a <@&${grade1}>.`, ephemeral: true });
			}
			if (currentGrade !== 0) {
				await interaction.guild.members.fetch(user.id).then(member => member.roles.add(interaction.guild.roles.cache.find(role => role.id == nextGrade)));
				await interaction.guild.members.fetch(user.id).then(member => member.roles.remove(interaction.guild.roles.cache.find(role => role.id == currentGrade)));
				await interaction.reply({ content: `${user} grade upgrated!\n<@&${currentGrade}> to <@&${nextGrade}>`, ephemeral: true });
			}
			changeNickname(interaction, user.id);
		}
	},
};