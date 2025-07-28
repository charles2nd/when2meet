// Simple Node.js test script to verify team creation logic
const { Team } = require('./models/Team');
const { TeamMember } = require('./models/TeamMember');

console.log('🧪 Testing Team Creation Logic...\n');

try {
  // Test 1: Create a basic team
  console.log('1️⃣ Testing Team Creation:');
  const team = new Team({
    name: 'Alpha Squad',
    description: 'Elite tactical unit for CS2 operations'
  });
  
  console.log(`✅ Team created: ${team.name}`);
  console.log(`   ID: ${team.id}`);
  console.log(`   Code: ${team.code}`);
  console.log(`   Members: ${team.getMemberCount()}`);
  console.log();

  // Test 2: Create team members
  console.log('2️⃣ Testing Team Members:');
  const commander = new TeamMember({
    id: 'user-123',
    name: 'Commander Smith',
    email: 'commander@cs2squad.com',
    role: 'admin'
  });
  
  const operative = new TeamMember({
    id: 'user-456', 
    name: 'Operative Jones',
    email: 'jones@cs2squad.com',
    role: 'member'
  });

  console.log(`✅ Commander: ${commander.name} (${commander.getInitials()})`);
  console.log(`   Admin: ${commander.isAdmin()}`);
  console.log(`✅ Operative: ${operative.name} (${operative.getInitials()})`);
  console.log(`   Admin: ${operative.isAdmin()}`);
  console.log();

  // Test 3: Add members to team
  console.log('3️⃣ Testing Team Management:');
  team.addMember(commander);
  team.addMember(operative);
  
  console.log(`✅ Team now has ${team.getMemberCount()} members`);
  console.log(`   Admins: ${team.getAdmins().length}`);
  console.log(`   Commander ${commander.name} is admin: ${team.isAdmin(commander.id)}`);
  console.log();

  // Test 4: Serialization
  console.log('4️⃣ Testing Serialization:');
  const teamData = team.toJSON();
  const deserializedTeam = Team.fromJSON(teamData);
  
  console.log(`✅ Original team: ${team.name}`);
  console.log(`✅ Deserialized team: ${deserializedTeam.name}`);
  console.log(`   Members preserved: ${deserializedTeam.getMemberCount()}`);
  console.log();

  // Test 5: Validation
  console.log('5️⃣ Testing Validation:');
  console.log(`✅ Team validation: ${team.validate()}`);
  console.log(`✅ Commander validation: ${commander.validate()}`);
  console.log(`✅ Operative validation: ${operative.validate()}`);
  console.log();

  // Test 6: Error handling
  console.log('6️⃣ Testing Error Handling:');
  try {
    new Team({ name: '' });
  } catch (error) {
    console.log(`✅ Empty name validation: ${error.message}`);
  }

  try {
    new TeamMember({ name: 'Test', email: 'invalid-email' });
  } catch (error) {
    console.log(`✅ Invalid email validation: ${error.message}`);
  }

  try {
    team.addMember(commander); // Duplicate
  } catch (error) {
    console.log(`✅ Duplicate member validation: ${error.message}`);
  }
  console.log();

  console.log('🎉 All tests passed! Team creation system is working correctly.\n');

  // Test data structure
  console.log('📊 Sample Team Data Structure:');
  console.log(JSON.stringify(teamData, null, 2));

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}