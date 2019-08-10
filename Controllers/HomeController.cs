using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using flow.Models;
using System.IO;
using Newtonsoft.Json;

namespace flow.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public JsonResult ProcessFlow()
        {
            var currentDir = Directory.GetCurrentDirectory();
            string stepsFile = Path.Combine(currentDir, @"Models\steps.json");
            List<StepViewModel> steps = new List<StepViewModel>();

            using (var streamReader = new StreamReader(stepsFile))
            {                
                string json = streamReader.ReadToEnd();
                steps = JsonConvert.DeserializeObject<List<StepViewModel>>(json);
                
                return Json(steps);
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
