using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace flow.Models
{
    public class ProcessViewModel
    {
        public int Id { get; set; }
        public int NumLevels { get; set; }
    }

    public class StepViewModel
    {
        public int Id { get; set; }
        public int Level { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int? PreviousStepId { get; set; }
        public int? Symlink { get; set; }
        public int? SymlinkLevel { get; set; }
        public int ProcessRefId { get; set; }
    }
}
