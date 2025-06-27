using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public interface ITeamCollaborationService
    {
        Task<Team> CreateTeamAsync(string name, string description, Guid createdById);
        Task<bool> AddTeamMemberAsync(Guid teamId, Guid userId, string role = "Member");
        Task<bool> RemoveTeamMemberAsync(Guid teamId, Guid userId);
        Task<IEnumerable<Team>> GetUserTeamsAsync(Guid userId);
        Task<Team?> GetTeamAsync(Guid teamId);
        Task<IEnumerable<TeamMember>> GetTeamMembersAsync(Guid teamId);
        Task<bool> UpdateTeamMemberRoleAsync(Guid teamId, Guid userId, string newRole);
        Task<TeamProject> CreateProjectAsync(Guid teamId, string name, string description, Guid createdById);
        Task<IEnumerable<TeamProject>> GetTeamProjectsAsync(Guid teamId);
        Task<bool> AssignProjectMemberAsync(Guid projectId, Guid userId);
    }

    public class TeamCollaborationService : ITeamCollaborationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<TeamCollaborationService> _logger;

        public TeamCollaborationService(AttendancePlatformDbContext context, ILogger<TeamCollaborationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Team> CreateTeamAsync(string name, string description, Guid createdById)
        {
            try
            {
                var team = new Team
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Description = description,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Teams.Add(team);

                var teamMember = new TeamMember
                {
                    Id = Guid.NewGuid(),
                    TeamId = team.Id,
                    UserId = createdById,
                    Role = "Owner",
                    JoinedAt = DateTime.UtcNow
                };

                _context.TeamMembers.Add(teamMember);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Team created successfully. TeamId: {TeamId}, Name: {Name}", team.Id, name);
                return team;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating team. Name: {Name}, CreatedById: {CreatedById}", name, createdById);
                throw;
            }
        }

        public async Task<bool> AddTeamMemberAsync(Guid teamId, Guid userId, string role = "Member")
        {
            try
            {
                var existingMember = await _context.TeamMembers
                    .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);

                if (existingMember != null)
                    return false;

                var teamMember = new TeamMember
                {
                    Id = Guid.NewGuid(),
                    TeamId = teamId,
                    UserId = userId,
                    Role = role,
                    JoinedAt = DateTime.UtcNow
                };

                _context.TeamMembers.Add(teamMember);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Team member added successfully. TeamId: {TeamId}, UserId: {UserId}, Role: {Role}", 
                    teamId, userId, role);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding team member. TeamId: {TeamId}, UserId: {UserId}", teamId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveTeamMemberAsync(Guid teamId, Guid userId)
        {
            try
            {
                var teamMember = await _context.TeamMembers
                    .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);

                if (teamMember == null)
                    return false;

                _context.TeamMembers.Remove(teamMember);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Team member removed successfully. TeamId: {TeamId}, UserId: {UserId}", teamId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing team member. TeamId: {TeamId}, UserId: {UserId}", teamId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<Team>> GetUserTeamsAsync(Guid userId)
        {
            try
            {
                var teams = await _context.TeamMembers
                    .Include(tm => tm.Team)
                    .Where(tm => tm.UserId == userId && tm.Team.IsActive)
                    .Select(tm => tm.Team)
                    .ToListAsync();

                return teams;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user teams. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<Team?> GetTeamAsync(Guid teamId)
        {
            try
            {
                var team = await _context.Teams
                    .Include(t => t.Members)
                    .ThenInclude(tm => tm.User)
                    .FirstOrDefaultAsync(t => t.Id == teamId && t.IsActive);

                return team;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team. TeamId: {TeamId}", teamId);
                throw;
            }
        }

        public async Task<IEnumerable<TeamMember>> GetTeamMembersAsync(Guid teamId)
        {
            try
            {
                var members = await _context.TeamMembers
                    .Include(tm => tm.User)
                    .Where(tm => tm.TeamId == teamId)
                    .ToListAsync();

                return members;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team members. TeamId: {TeamId}", teamId);
                throw;
            }
        }

        public async Task<bool> UpdateTeamMemberRoleAsync(Guid teamId, Guid userId, string newRole)
        {
            try
            {
                var teamMember = await _context.TeamMembers
                    .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);

                if (teamMember == null)
                    return false;

                teamMember.Role = newRole;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Team member role updated successfully. TeamId: {TeamId}, UserId: {UserId}, NewRole: {NewRole}", 
                    teamId, userId, newRole);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating team member role. TeamId: {TeamId}, UserId: {UserId}", teamId, userId);
                throw;
            }
        }

        public async Task<TeamProject> CreateProjectAsync(Guid teamId, string name, string description, Guid createdById)
        {
            try
            {
                var project = new TeamProject
                {
                    Id = Guid.NewGuid(),
                    TeamId = teamId,
                    Name = name,
                    Description = description,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Active",
                    Priority = "Medium"
                };

                _context.TeamProjects.Add(project);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Team project created successfully. ProjectId: {ProjectId}, Name: {Name}, TeamId: {TeamId}", 
                    project.Id, name, teamId);
                return project;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating team project. Name: {Name}, TeamId: {TeamId}", name, teamId);
                throw;
            }
        }

        public async Task<IEnumerable<TeamProject>> GetTeamProjectsAsync(Guid teamId)
        {
            try
            {
                var projects = await _context.TeamProjects
                    .Include(tp => tp.ProjectMembers)
                    .ThenInclude(pm => pm.User)
                    .Where(tp => tp.TeamId == teamId)
                    .OrderByDescending(tp => tp.CreatedAt)
                    .ToListAsync();

                return projects;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team projects. TeamId: {TeamId}", teamId);
                throw;
            }
        }

        public async Task<bool> AssignProjectMemberAsync(Guid projectId, Guid userId)
        {
            try
            {
                var existingAssignment = await _context.ProjectMembers
                    .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

                if (existingAssignment != null)
                    return false;

                var projectMember = new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    UserId = userId,
                    AssignedAt = DateTime.UtcNow,
                    Role = "Contributor"
                };

                _context.ProjectMembers.Add(projectMember);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Project member assigned successfully. ProjectId: {ProjectId}, UserId: {UserId}", 
                    projectId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning project member. ProjectId: {ProjectId}, UserId: {UserId}", 
                    projectId, userId);
                throw;
            }
        }
    }
}
