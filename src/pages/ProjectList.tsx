import { createId } from '@paralleldrive/cuid2'
import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon } from 'lucide-react'
import { Link, LoaderFunctionArgs, useNavigate } from 'react-router-dom'

import { tw } from '~lib/utils'
import { Q, queryClient, useCreateProjectMutation, useDeleteProjectMutation } from '~queries'
import type { IProject } from '~schemas'

const projectsQuery = Q.project.list

const ProjectListPage = () => {
  const navigate = useNavigate()
  const { data: projects } = useQuery(projectsQuery)
  const { mutateAsync: createProject, isLoading: isCreatingField } = useCreateProjectMutation()
  const { mutateAsync: deleteProject } = useDeleteProjectMutation()
  const handleAddProject = async () => {
    const id = createId()
    await createProject({
      id,
      name: 'My Project',
      fields: [],
      outlets: [],
      // refinements: {},
    })
    navigate(`/project/${id}`)
  }

  const handleDeleteProject = async (projectId: string) => {
    deleteProject({ projectId })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Projects</h2>
        <div>
          <button
            disabled={isCreatingField}
            type="button"
            className={tw('btn btn-xs btn-link', isCreatingField && 'loading')}
            onClick={handleAddProject}
          >
            + Add Project
          </button>
        </div>
      </div>

      <ul className="divide-base-200 my-1 divide-y overflow-y-auto">
        {projects?.map((project) => (
          <ProjectListItem key={project.id} project={project} onDelete={() => handleDeleteProject(project.id)} />
        ))}
      </ul>
    </div>
  )
}

export const loader = ({ params: _ }: LoaderFunctionArgs) => {
  return queryClient.fetchQuery(projectsQuery)
}

export default ProjectListPage

interface ProjectListItemProps {
  project: IProject
  onDelete: () => void
}

const ProjectListItem = ({ project }: ProjectListItemProps) => (
  <li className="hover:bg-base-200">
    <Link to={`project/${project.id}`} className="flex justify-between p-2">
      <div>
        <h3 className="text-sm font-semibold">{project.name}</h3>
      </div>

      <div className="flex items-center gap-x-1">
        <ChevronRightIcon size={20} className="text-base-300 scale-y-150" />
      </div>
    </Link>
  </li>
)
